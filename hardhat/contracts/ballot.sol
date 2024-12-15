// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^ 0.8.24;

// Import TFHE (Fully Homomorphic Encryption) related contracts

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

/**
 * @title Ballot
 * @dev A confidential voting contract using FHE (Fully Homomorphic Encryption)
 * Allows for encrypted voting where vote counts remain private until decryption
 */
contract Ballot is
SepoliaZamaFHEVMConfig,
  SepoliaZamaGatewayConfig,
  GatewayCaller{
    
    struct Proposal {
        string name;
        euint16 voteCount;
  }

  mapping(uint16 => Proposal) public proposals;
  mapping(address => bool) public hasVoted;

    uint16 public constant MAX_PROPOSALS = 3;

    uint256 public startTime;
    uint16 public duration;
    uint16 public proposalCount;
    bool public ballotFinished;
    uint16 public decryptedValue;
  uint16[MAX_PROPOSALS] public results;


  constructor(uint16 _duration) {
    startTime = 0;
    duration = _duration;
    ballotFinished = false;
  }
  
    /**
     * @dev Creates a new proposal before ballot starts
     * @param proposalName Name of the proposal to be added
     */
  function createProposal(string memory proposalName) public {
    require(startTime == 0, "Ballot has already started - cannot add new proposals");
    proposals[proposalCount] = Proposal({ name: proposalName, voteCount: TFHE.asEuint16(0) });
    TFHE.allowThis(proposals[proposalCount].voteCount);
    proposalCount++;
  }

  function getProposal(uint16 _index) public view returns(Proposal memory) {
    return proposals[_index];
  }

  function getResults() public view returns(uint16[MAX_PROPOSALS] memory) {
    return results;
  }

  /**
   * @dev Starts the ballot by setting the start time
   */
  function startBallot() public {
    startTime = block.timestamp;
  }

  /**
   * @dev Callback function for decryption results
   * @param requestId The request ID for the decryption
   * @param dVoteCount The decrypted vote count
   */
  function onVoteCountDecrypted(uint64 requestId, uint16 dVoteCount) public onlyGateway {
        emit VoteCountDecrypted(requestId, dVoteCount);
  }

   event VoteCountDecrypted(uint64 requestId, uint16 decryptedVoteCount);

  /**
   * @dev Casts a vote for a specific proposal
   * @param value1 The encrypted vote for the first proposal
   * @param value2 The encrypted vote for the second proposal
   * @param value3 The encrypted vote for the third proposal
   * @param inputProof The proof of the input
   */
  function castVote(einput value1, einput value2, einput value3, bytes calldata inputProof) external {
    require(isActive(), "Ballot is finished");
    // require(!hasVoted[msg.sender], "Already voted"); // Uncomment this line for production
    _processVotes(TFHE.asEbool(value1, inputProof), TFHE.asEbool(value2, inputProof), TFHE.asEbool(value3, inputProof)); // Each vote counts as 1
    hasVoted[msg.sender] = true;
  }

  /**
   * @dev Internal function to process votes
   * @param prop1 The encrypted vote for the first proposal
   * @param prop2 The encrypted vote for the second proposal
   * @param prop3 The encrypted vote for the third proposal
   */
  function _processVotes(ebool prop1, ebool prop2, ebool prop3) internal {
    proposals[0].voteCount = TFHE.add(proposals[0].voteCount, TFHE.asEuint16(prop1));
    proposals[1].voteCount = TFHE.add(proposals[1].voteCount, TFHE.asEuint16(prop2));
    proposals[2].voteCount = TFHE.add(proposals[2].voteCount, TFHE.asEuint16(prop3));
    TFHE.allowThis(proposals[0].voteCount);
    TFHE.allowThis(proposals[1].voteCount);
    TFHE.allowThis(proposals[2].voteCount);
  }

  /**
   * @dev Checks if the ballot is active
   * @return true if the ballot is active, false otherwise
   */
  function isActive() public view returns(bool) {
    return block.timestamp < startTime + duration;
  }


  /**
   * @dev Finishes the ballot by requesting decryption and setting the ballotFinished flag
   */
  function finishBallot() public {
    // require(!isActive(), "Ballot is still ongoing");
    _decryptedVoteCount();
    ballotFinished = true;
  }

  /**
   * @dev Returns the status of the ballot
   * @return true if the ballot is finished, false otherwise
   */
  function get_ballot_status() public view returns(bool) {
    return ballotFinished;
  }

  function getWinner() public view returns(uint16) {
    require(ballotFinished, "Ballot is not finished");
        uint16 maxVotes = 0;
        uint16 maxIndex = 0;
    for (uint16 i = 0; i < proposalCount; i++) {
      if (results[i] > maxVotes) {
        maxVotes = results[i];
        maxIndex = i;
      }
    }
    return maxIndex;
  }


  /**
   * @dev Internal function to trigger decryption and populate results
   */
  function _decryptedVoteCount() internal {
    uint256[] memory cts = new uint256[](proposalCount);
    for (uint16 index = 0; index < proposalCount; index++) {
      cts[index] = Gateway.toUint256(proposals[index].voteCount);
    }
    Gateway.requestDecryption(cts, this.callbackSecret.selector, 0, block.timestamp + 100, false);
    }

  /**
   * @dev Callback function for decryption results
   * @param dValue The decrypted vote counts
   */
  function callbackSecret(uint256, uint16[MAX_PROPOSALS] memory dValue) public onlyGateway {
    for (uint16 index = 0; index < proposalCount; index++) {
      results[index] = dValue[index];
    }
  }
}