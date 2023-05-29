import { ethers } from "ethers";
import * as fs from "fs";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const PORT = 8000;

const PROVIDER_API_KEY =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// providers
const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.g.alchemy.com/v2/${PROVIDER_API_KEY}`
);
const sepoliaProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${PROVIDER_API_KEY}`
);

// signers
const mumbaiSigner = new ethers.Wallet(PRIVATE_KEY).connect(mumbaiProvider);
const sepoliaSigner = new ethers.Wallet(PRIVATE_KEY).connect(sepoliaProvider);

// contracts
const L2TokenVault = JSON.parse(
  fs.readFileSync("./contracts/L2TokenVault.json", {
    encoding: "utf8",
  })
);
const L2TokenClone = JSON.parse(
  fs.readFileSync("./contracts/L2TokenClone.json", { encoding: "utf8" })
);

console.log(`vault: ${L2TokenVault.address}`);
console.log(`tokenClone: ${L2TokenClone.address}`);

// contract instances
const vault = new ethers.Contract(
  L2TokenVault.address,
  L2TokenVault.abi,
  mumbaiSigner
);
const tokenClone = new ethers.Contract(
  L2TokenClone.address,
  L2TokenClone.abi,
  sepoliaSigner
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
  const handleDeposits = async () => {
    console.log("listening for deposits...");
    console.log("-----");

    vault.on("Deposit", async (depositor, amount, nonce) => {
      console.log(
        `deposited ${ethers.utils.formatEther(amount)} MATIC(fee: 0.01 MATIC)✅`
      );

      const oldBal = await tokenClone.balanceOf(depositor);
      console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATICc`);

      // await tokenClone.connect(owner).mint(depositor, amount, nonce)
      const tx = await tokenClone.mint(depositor, amount, nonce);
      await tx.wait(1);
      console.log(`minted ${ethers.utils.formatEther(amount)} MATICc✅`);

      const newBal = await tokenClone.balanceOf(depositor);
      console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATICc`);
      console.log("-----");
    });
  };

  const handleWithdrawals = async () => {
    console.log("listening for withdrawals...");
    console.log("-----");

    tokenClone.on("Withdraw", async (withdrawer, amount, nonce) => {
      console.log(`burned ${ethers.utils.formatEther(amount)} MATICc`);

      const oldBal = await mumbaiProvider.getBalance(withdrawer);
      console.log(`old balance: ${ethers.utils.formatEther(oldBal)} MATIC`);

      const tx = await vault.transfer(withdrawer, amount, nonce);
      await tx.wait(1);
      console.log(
        `transferred ${ethers.utils.formatEther(amount)} MATIC✅ to depositor`
      );

      const newBal = await mumbaiProvider.getBalance(withdrawer);
      console.log(`new balance: ${ethers.utils.formatEther(newBal)} MATIC`);
      console.log("-----");
    });
  };

  handleDeposits().catch((error) => {
    console.error(error);
    process.exit(1);
  });

  handleWithdrawals().catch((error) => {
    console.error(error);
    process.exit(1);
  });
});
