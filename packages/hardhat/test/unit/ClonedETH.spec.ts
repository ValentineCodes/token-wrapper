import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { ClonedETH } from "../../typechain-types";

describe("ClonedETH", function () {
  const depositAmount = ethers.utils.parseEther("0.5");
  const withdrawAmount = ethers.utils.parseEther("0.2");

  let valentine: SignerWithAddress;

  let ClonedETH: ClonedETH;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    valentine = signers[0];

    await deployments.fixture(["ClonedETH"]);

    ClonedETH = await ethers.getContract("ClonedETH", valentine);
  });

  describe("deposit", () => {
    it("mints deposited amount to depositor and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ClonedETH balance: ${ethers.utils.formatEther(oldClonedETHBal)} ClonedETH`);
      console.log("-----");

      console.log("depositing 0.5 ETH...");
      await expect(ClonedETH.deposit({ value: depositAmount }))
        .to.emit(ClonedETH, "ETHDeposited")
        .withArgs(valentine.address, depositAmount);
      console.log("deposit successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ClonedETH balance: ${ethers.utils.formatEther(newClonedETHBal)} ClonedETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newClonedETHBal).to.eq(oldClonedETHBal.add(depositAmount));
    });
    it("reverts if amount is ZERO", async () => {
      await expect(ClonedETH.deposit({ value: 0 })).to.be.revertedWithCustomError(
        ClonedETH,
        "ClonedETH__InvalidAmount",
      );
    });
  });

  describe("withdraw", () => {
    it("withdraws amount to owner and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ClonedETH balance: ${ethers.utils.formatEther(oldClonedETHBal)} ClonedETH`);
      console.log("-----");

      console.log("withdrawing 0.2 ClonedETH...");
      await expect(ClonedETH.withdraw(withdrawAmount))
        .to.emit(ClonedETH, "ETHWithdrawn")
        .withArgs(valentine.address, withdrawAmount);
      console.log("withdrawal successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ClonedETH balance: ${ethers.utils.formatEther(newClonedETHBal)} ClonedETH`);

      expect(newETHBal).to.be.greaterThan(oldETHBal);
      expect(newClonedETHBal).to.eq(oldClonedETHBal.sub(withdrawAmount));
    });
    it("reverts if balance is insufficient", async () => {
      await expect(ClonedETH.withdraw(ethers.utils.parseEther("0.55"))).to.reverted;
    });
  });

  describe("receive", () => {
    it("mints ClonedETH for every amount transferred to ClonedETH contract", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ClonedETH balance: ${ethers.utils.formatEther(oldClonedETHBal)} ClonedETH`);
      console.log("-----");

      console.log("transferring 0.5 ETH to iETH...");
      await valentine.sendTransaction({
        to: ClonedETH.address,
        value: depositAmount,
      });
      console.log("transfer successful✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newClonedETHBal = await ClonedETH.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ClonedETH balance: ${ethers.utils.formatEther(newClonedETHBal)} ClonedETH`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newClonedETHBal).to.eq(oldClonedETHBal.add(depositAmount));
    });
  });
});
