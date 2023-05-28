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

  vault.on("Deposit", async (depositor, amount, nonce) => {
    console.log(`deposited ${ethers.utils.formatEther(amount)} MATIC(fee: 0.01 MATIC)✅`);

    const oldBal = await tokenClone.balanceOf(depositor);
    console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATICc`);

    await tokenClone.connect(owner).mint(depositor, amount, nonce);
    console.log(`minted ${ethers.utils.formatEther(amount)} MATICc✅`);

    const newBal = await tokenClone.balanceOf(depositor);
    console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATICc`);
    console.log("-----");

    // test fee withdrawal
    // const provider = ethers.provider;

    // const oldCustodialBal = await provider.getBalance(owner.address);
    // console.log(`old custodial balance: ${ethers.utils.formatEther(oldCustodialBal)} MATIC`);

    // const fees = await vault.getFees();
    // await vault.withdrawFees();
    // console.log(`withdrew ${ethers.utils.formatEther(fees)} MATIC fees✅`);

    // const newCustodialBal = await provider.getBalance(owner.address);
    // console.log(`new custodial balance: ${ethers.utils.formatEther(newCustodialBal)} MATIC`);
    // console.log("-----");

    // await tokenClone.burn(newBal);
    // console.log(`burned ${ethers.utils.formatEther(newBal)} MATIC✅`);
  });
};

const handleWithdrawals = async () => {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const valentine: SignerWithAddress = signers[1];

  const vault = await ethers.getContract("L2TokenVault");
  const tokenClone = await ethers.getContract("L2TokenClone", valentine);

  console.log("listening for withdrawals...");
  console.log("-----");

  tokenClone.on("Withdraw", async (withdrawer, amount, nonce) => {
    console.log(`burned ${ethers.utils.formatEther(amount)} MATICc`);
    const provider = ethers.provider;
    const oldBal = await provider.getBalance(withdrawer);
    console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATIC`);

    await vault.transfer(withdrawer, amount, nonce);
    console.log(`transferred ${ethers.utils.formatEther(amount)} MATIC✅ to depositor`);

    const newBal = await provider.getBalance(withdrawer);
    console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATIC`);
    console.log("-----");
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
