import { expect } from "chai";
import { network } from "hardhat";

import { awaitAllDecryptionResults, initGateway } from "../asyncDecrypt";
import { createInstance } from "../instance";
import { getSigners, initSigners } from "../signers";
import { debug } from "../utils";
import { deployBallot } from "./Ballot.fixture";
import { reencryptEuint16 } from "../reencrypt";

describe("Ballot", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
    await initGateway();
  });

  beforeEach(async function () {
    const contract = await deployBallot();
    this.contractAddress = await contract.getAddress();
    this.ballot = contract;
    //this.fhevm = await createInstance();
    this.instances = await createInstance();
  });

  it("should deploy the contract", async function () {
    expect(this.contractAddress).to.properAddress;
  });

  it("should not be able to be finished", async function () {
    const isFinished = await this.ballot.get_ballot_status();
    expect(isFinished).to.be.false;
  });

  it("should create a proposal", async function () {
    await this.ballot.createProposal("Proposal 1");
    const proposal = await this.ballot.getProposal(0);
    expect(proposal.name).to.equal("Proposal 1");

    // expect(proposal.voteCount).to.equal(0);
  });

  it("should start the ballot", async function () {
    await this.ballot.startBallot();
    const startTime = await this.ballot.startTime();
    expect(startTime).to.be.gt(0);
  });

  it("should allow voting", async function () {
    await this.ballot.createProposal("Proposal 1");
    await this.ballot.createProposal("Proposal 2");
    await this.ballot.createProposal("Proposal 3");

    await this.ballot.startBallot();
    const input = this.instances.createEncryptedInput(this.contractAddress, this.signers.alice.address);
    input.addBool(false).addBool(false).addBool(true);
    const support = await input.encrypt();

    // Cast the vote
    const tx = await this.ballot.castVote(support.handles[0],support.handles[1],support.handles[2], support.inputProof);
    await tx.wait();

 
    const tx2 = await this.ballot.decryptedVoteCount(0);
    await tx2.wait();    

    await awaitAllDecryptionResults();
    const decryptedVotes0 = await this.ballot.revealedSecret();
    expect(decryptedVotes0).to.equal(0);


    const tx3 = await this.ballot.decryptedVoteCount(2);
    await tx3.wait();    

    await awaitAllDecryptionResults();
    const decryptedVotes2 = await this.ballot.revealedSecret();
    console.log("a ver que dice este contrato:", decryptedVotes2)
    expect(decryptedVotes2).to.equal(1);

    // const decryptedVotes3 = this.ballot.decrypt(encryptedVotes3);
    // expect(decryptedVotes2).to.equal(0); // No votes for the second proposal
    // expect(decryptedVotes3).to.equal(0); // No votes for the third proposal


  });

  // it("should finish the ballot after duration", async function () {
  //   await this.ballot.startBallot();
  //   await network.provider.send("evm_increaseTime", [7200]); // Increase time by 1 hour
  //   await network.provider.send("evm_mine"); // Mine a new block
  //   await this.ballot.finishBallot();
  //   const isFinished = await this.ballot.get_ballot_status();
  //   expect(isFinished).to.be.true;
  // });

  // it("should get the correct result after ballot is finished", async function () {
  //   await this.ballot.createProposal("Proposal 1");
  //   await this.ballot.createProposal("Proposal 2");
  //   await this.ballot.startBallot();
  //   await this.ballot.castVote(0);
  //   await this.ballot.castVote(0);
  //   await this.ballot.castVote(1);
  //   await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
  //   await network.provider.send("evm_mine"); // Mine a new block
  //   await this.ballot.finishBallot();
  //   const result = await this.ballot.get_result();
  //   expect(result.name).to.equal("Proposal 1");
  //   expect(result.voteCount).to.equal(2);
  // });

  // it("should not allow voting after ballot is finished", async function () {
  //   await this.ballot.createProposal("Proposal 1");
  //   await this.ballot.startBallot();
  //   await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
  //   await network.provider.send("evm_mine"); // Mine a new block
  //   await this.ballot.finishBallot();
  //   const isFinished = await this.ballot.get_ballot_status();
  //   await expect(this.ballot.castVote(0)).to.be.revertedWith("Ballot is finished");
  // });
});
