import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { AfterLife, ERC20TokenClone } from "../../typechain-types";

describe("ERC20TokenClone", function () {
  const depositAmount = ethers.utils.parseEther("0.5");
  const withdrawAmount = ethers.utils.parseEther("0.2");

  let owner: SignerWithAddress;
  let valentine: SignerWithAddress;

  let cToken: ERC20TokenClone;
  let afterlife: AfterLife;

  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];
    valentine = signers[1];

    await deployments.fixture(["AfterLife", "ERC20TokenClone"]);

    cToken = await ethers.getContract("ERC20TokenClone", valentine);
    afterlife = await ethers.getContract("AfterLife", valentine);
  });

  describe("deposit", () => {
    it("mints deposited amount to depositor and emits an event", async () => {
      await afterlife.connect(owner).transfer(valentine.address, depositAmount);

      await afterlife.approve(cToken.address, depositAmount);
      console.log("approved cToken contract to spend 0.5 Tokens✅");
      console.log("-----");

      const oldTokenBal = await afterlife.balanceOf(valentine.address);
      const oldcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`old Token balance: ${ethers.utils.formatEther(oldTokenBal)}`);
      console.log(`old cToken balance: ${ethers.utils.formatEther(oldcTokenBal)}`);
      console.log("-----");

      await expect(cToken.deposit(depositAmount)).to.emit(cToken, "Transfer");
      console.log("successfully deposited 0.5 Tokens✅");
      console.log("-----");

      const newTokenBal = await afterlife.balanceOf(valentine.address);
      const newcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`new Token balance: ${ethers.utils.formatEther(newTokenBal)}`);
      console.log(`new cToken balance: ${ethers.utils.formatEther(newcTokenBal)}`);

      expect(newTokenBal).to.eq(oldTokenBal.sub(depositAmount));
      expect(newcTokenBal).to.eq(oldcTokenBal.add(depositAmount));
    });
  });

  describe("withdraw", () => {
    it("withdraws amount to owner and emits an event", async () => {
      const oldTokenBal = await afterlife.balanceOf(valentine.address);
      const oldcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`old Token balance: ${ethers.utils.formatEther(oldTokenBal)}`);
      console.log(`old cToken balance: ${ethers.utils.formatEther(oldcTokenBal)}`);
      console.log("-----");

      await expect(cToken.withdraw(withdrawAmount)).to.emit(cToken, "Transfer");
      console.log("successfully withdrew 0.2 Tokens✅");
      console.log("-----");

      const newTokenBal = await afterlife.balanceOf(valentine.address);
      const newcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`new Token balance: ${ethers.utils.formatEther(newTokenBal)}`);
      console.log(`new cToken balance: ${ethers.utils.formatEther(newcTokenBal)}`);

      expect(newTokenBal).to.eq(oldTokenBal.add(withdrawAmount));
      expect(newcTokenBal).to.eq(oldcTokenBal.sub(withdrawAmount));
    });
  });

  describe("recover", () => {
    it("mints cloned token to cover any underlyingTokens that would have been transferred by mistake", async () => {
      await afterlife.transfer(cToken.address, withdrawAmount);
      console.log("transfered 0.2 Tokens to cToken contract⛔️");
      console.log("-----");

      const tokenBal = await afterlife.balanceOf(valentine.address);
      const oldcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`Token balance: ${ethers.utils.formatEther(tokenBal)}`);
      console.log(`old cToken balance: ${ethers.utils.formatEther(oldcTokenBal)}`);
      console.log("-----");

      await expect(cToken.connect(owner).recover(valentine.address)).to.emit(cToken, "Transfer");
      console.log("recovery successful✅");
      console.log("-----");

      const newcTokenBal = await cToken.balanceOf(valentine.address);
      console.log(`new cToken balance: ${ethers.utils.formatEther(newcTokenBal)}`);

      expect(newcTokenBal).to.eq(oldcTokenBal.add(withdrawAmount));
    });
  });
});
