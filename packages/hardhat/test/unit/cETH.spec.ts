import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { CETH } from "../../typechain-types";

describe("cETH", function () {
  const depositAmount = ethers.utils.parseEther("0.5");
  const withdrawAmount = ethers.utils.parseEther("0.2");

  let valentine: SignerWithAddress;

  let cETH: CETH;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    valentine = signers[0];

    await deployments.fixture(["cETH"]);

    cETH = await ethers.getContract("cETH", valentine);
  });

  describe("deposit", () => {
    it("mints deposited amount to depositor and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");

      await expect(cETH.deposit({ value: depositAmount }))
        .to.emit(cETH, "ETHDeposited")
        .withArgs(valentine.address, depositAmount);

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.add(depositAmount));
    });
    it("reverts if amount is ZERO", async () => {
      await expect(cETH.deposit({ value: 0 })).to.be.revertedWithCustomError(cETH, "cETH__InvalidAmount");
    });
  });

  describe("withdraw", () => {
    it("withdraws amount to owner and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");
      await expect(cETH.withdraw(withdrawAmount))
        .to.emit(cETH, "ETHWithdrawn")
        .withArgs(valentine.address, withdrawAmount);

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.greaterThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.sub(withdrawAmount));
    });
    it("reverts if balance is insufficient", async () => {
      await expect(cETH.withdraw(ethers.utils.parseEther("0.55"))).to.revertedWithCustomError(
        cETH,
        "cETH__InsufficientFunds",
      );
    });
  });

  describe("receive", () => {
    it("mints cETH for every amount transferred to cETH contract", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");

      await valentine.sendTransaction({
        to: cETH.address,
        value: depositAmount,
      });

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.add(depositAmount));
    });
  });
});
