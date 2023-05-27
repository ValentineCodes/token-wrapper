import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { ClonedETH } from "../../typechain-types";

describe("ClonedETH", function () {
  const depositAmount = ethers.utils.parseEther("0.5");
  const withdrawAmount = ethers.utils.parseEther("0.2");

  let valentine: SignerWithAddress;

  let cETH: ClonedETH;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    valentine = signers[0];

    await deployments.fixture(["ClonedETH"]);

    cETH = await ethers.getContract("ClonedETH", valentine);
  });

  describe("deposit", () => {
    it("mints deposited amount to depositor and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");

      console.log("depositing 0.5 ETH...");
      await expect(cETH.deposit({ value: depositAmount }))
        .to.emit(cETH, "ETHDeposited")
        .withArgs(valentine.address, depositAmount);
      console.log("deposit successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.add(depositAmount));
    });
    it("reverts if amount is ZERO", async () => {
      await expect(cETH.deposit({ value: 0 })).to.be.revertedWithCustomError(cETH, "ClonedETH__InvalidAmount");
    });
  });

  describe("withdraw", () => {
    it("withdraws amount to owner and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");

      console.log("withdrawing 0.2 cETH...");
      await expect(cETH.withdraw(withdrawAmount))
        .to.emit(cETH, "ETHWithdrawn")
        .withArgs(valentine.address, withdrawAmount);
      console.log("withdrawal successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.greaterThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.sub(withdrawAmount));
    });
    it("reverts if balance is insufficient", async () => {
      await expect(cETH.withdraw(ethers.utils.parseEther("0.55"))).to.reverted;
    });
  });

  describe("receive", () => {
    it("mints cETH for every amount transferred to cETH contract", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old cETH balance: ${ethers.utils.formatEther(oldcETHBal)} cETH`);
      console.log("-----");

      console.log("transferring 0.5 ETH to iETH...");
      await valentine.sendTransaction({
        to: cETH.address,
        value: depositAmount,
      });
      console.log("transfer successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newcETHBal = await cETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new cETH balance: ${ethers.utils.formatEther(newcETHBal)} cETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newcETHBal).to.eq(oldcETHBal.add(depositAmount));
    });
  });
});
