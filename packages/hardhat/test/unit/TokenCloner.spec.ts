import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { TokenCloner } from "../../typechain-types";

describe("TokenCloner", function () {
  let owner: SignerWithAddress;

  let token: TokenCloner;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];

    await deployments.fixture(["TokenCloner"]);

    token = await ethers.getContract("TokenCloner", owner);
  });

  describe("createClone", () => {
    it("clones ERC20 tokens", async () => {});
  });
});
