import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const handleDeposits = async () => {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = signers[0];
  const valentine: SignerWithAddress = signers[1];

  const vault = await ethers.getContract("L2TokenVault");
  const tokenClone = await ethers.getContract("L2TokenClone", valentine);

  console.log("listening for deposits...");
  console.log("-----");

  vault.on("Deposit", async (depositor, amount) => {
    console.log(`deposited ${ethers.utils.formatEther(amount)} MATIC(fee: 0.01 MATIC)✅`);

    const oldBal = await tokenClone.balanceOf(depositor);
    console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATICc`);

    await tokenClone.connect(owner).mint(depositor, amount);
    console.log(`minted ${ethers.utils.formatEther(amount)} MATICc✅`);

    const newBal = await tokenClone.balanceOf(depositor);
    console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATICc`);
    console.log("-----");
  });
};

const handleWithdrawals = async () => {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const valentine: SignerWithAddress = signers[1];

  const vault = await ethers.getContract("L2TokenVault");
  const tokenClone = await ethers.getContract("L2TokenClone", valentine);

  console.log("listening for withdrawals...");
  console.log("-----");

  tokenClone.on("Transfer", async (from, to, amount) => {
    if (to == ZERO_ADDRESS) {
      console.log(`burned ${ethers.utils.formatEther(amount)} MATICc`);
      const provider = ethers.provider;
      const oldBal = await provider.getBalance(from);
      console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATIC`);

      await vault.transfer(from, amount);
      console.log(`transferred ${ethers.utils.formatEther(amount)} MATIC✅ to depositor`);

      const newBal = await provider.getBalance(from);
      console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATIC`);
      console.log("-----");
    }
  });
};

handleDeposits().catch(error => {
  console.error(error);
  process.exit(1);
});

handleWithdrawals().catch(error => {
  console.error(error);
  process.exit(1);
});
