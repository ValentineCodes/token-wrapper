import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { ETHClone } from "../../typechain-types";

describe("ETHClone", function () {
  const depositAmount = ethers.utils.parseEther("0.5");
  const withdrawAmount = ethers.utils.parseEther("0.2");
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  let valentine: SignerWithAddress;

  let ETHc: ETHClone;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    valentine = signers[0];

    await deployments.fixture(["ETHClone"]);

    ETHc = await ethers.getContract("ETHClone", valentine);
  });

  describe("deposit", () => {
    it("mints deposited amount to depositor and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ETHc balance: ${ethers.utils.formatEther(oldETHcBal)} ETHc`);
      console.log("-----");

      await expect(ETHc.deposit({ value: depositAmount }))
        .to.emit(ETHc, "Transfer")
        .withArgs(ZERO_ADDRESS, valentine.address, depositAmount);
      console.log("successfully deposited 0.5 ETH✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ETHc balance: ${ethers.utils.formatEther(newETHcBal)} ETHc`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newETHcBal).to.eq(oldETHcBal.add(depositAmount));
    });
  });

  describe("withdraw", () => {
    it("withdraws amount to owner and emits an event", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ETHc balance: ${ethers.utils.formatEther(oldETHcBal)} ETHc`);
      console.log("-----");

      await expect(ETHc.withdraw(withdrawAmount))
        .to.emit(ETHc, "Transfer")
        .withArgs(valentine.address, ZERO_ADDRESS, withdrawAmount);
      console.log("successfully withdrew 0.2 ETHc✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ETHc balance: ${ethers.utils.formatEther(newETHcBal)} ETHc`);

      expect(newETHBal).to.be.greaterThan(oldETHBal);
      expect(newETHcBal).to.eq(oldETHcBal.sub(withdrawAmount));
    });
    it("reverts if balance is insufficient", async () => {
      await expect(ETHc.withdraw(ethers.utils.parseEther("0.55"))).to.reverted;
    });
  });

  describe("receive", () => {
    it("mints ETHc for every amount transferred to ETHc contract", async () => {
      const oldETHBal = await valentine.getBalance();
      const oldETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`old ETH balance: ${ethers.utils.formatEther(oldETHBal)} ETH`);
      console.log(`old ETHc balance: ${ethers.utils.formatEther(oldETHcBal)} ETHc`);
      console.log("-----");

      await valentine.sendTransaction({
        to: ETHc.address,
        value: depositAmount,
      });
      console.log("successfully transferred 0.5 ETH✅");
      console.log("-----");

      const newETHBal = await valentine.getBalance();
      const newETHcBal = await ETHc.balanceOf(valentine.address);

      console.log(`new ETH balance: ${ethers.utils.formatEther(newETHBal)} ETH`);
      console.log(`new ETHc balance: ${ethers.utils.formatEther(newETHcBal)} ETHc`);

      expect(newETHBal).to.be.lessThan(oldETHBal);
      expect(newETHcBal).to.eq(oldETHcBal.add(depositAmount));
    });
  });
});
