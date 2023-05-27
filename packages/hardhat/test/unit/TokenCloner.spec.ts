import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { AfterLife, TokenCloner } from "../../typechain-types";

describe("TokenCloner", function () {
  let owner: SignerWithAddress;

  let cloner: TokenCloner;
  let afterlife: AfterLife;
  before(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];

    await deployments.fixture(["AfterLife", "TokenCloner"]);

    cloner = await ethers.getContract("TokenCloner", owner);
    afterlife = await ethers.getContract("AfterLife");
  });

  describe("createClone", () => {
    it("clones ERC20 tokens and emits an event", async () => {
      const prevcTokens = await cloner.getTokenClones();

      await expect(cloner.createClone(afterlife.address, "AfterLife Clone", "cAL")).to.emit(cloner, "CloneCreated");
      console.log(`successfully cloned AfterLife(${afterlife.address})✅`);

      const currentcTokens = await cloner.getTokenClones();

      expect(await cloner.hasToken(afterlife.address)).to.be.true;
      expect(currentcTokens.length).to.eq(prevcTokens.length + 1);
    });

    it("reverts if name or symbol isn't specified", async () => {
      await expect(cloner.createClone(afterlife.address, "", "cAL")).to.revertedWithCustomError(
        cloner,
        "TokenCloner__EmptyName",
      );
      await expect(cloner.createClone(afterlife.address, "AfterLife Clone", "")).to.revertedWithCustomError(
        cloner,
        "TokenCloner__EmptySymbol",
      );
    });

    it("reverts if clone has already been created", async () => {
      await expect(cloner.createClone(afterlife.address, "AfterLife Clone", "cAL")).to.revertedWithCustomError(
        cloner,
        "TokenCloner__TokenExists",
      );
      await expect(cloner.createClone(owner.address, "AfterLife Clone", "cAL")).to.revertedWithCustomError(
        cloner,
        "TokenCloner__NameExists",
      );
      await expect(cloner.createClone(owner.address, "AfterLife Cloned", "cAL")).to.revertedWithCustomError(
        cloner,
        "TokenCloner__SymbolExists",
      );
    });
  });
});
