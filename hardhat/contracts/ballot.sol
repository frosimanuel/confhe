// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

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

    uint256 public startTime;
    uint16 public duration;
    uint16 public proposalCount;
    bool public ballotFinished;
    uint16 public revealedSecret;
    uint16 public winner;


    constructor(uint16 _duration) {
        startTime = 0;
        duration = _duration;
        proposalCount = 0;
        ballotFinished = false;
    }

    function createProposal(string memory proposalName) public {
        require(startTime == 0, "Ballot has already started - cannot add new proposals");
        proposals[proposalCount] = Proposal({name: proposalName, voteCount: TFHE.asEuint16(0)});
        TFHE.allowThis(proposals[proposalCount].voteCount);
        proposalCount++;
    }

    function getProposal(uint16 _index) public view returns (Proposal memory) {
        return proposals[_index];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

   function decryptedVoteCount(uint16 index) public returns (uint16) {
    uint256[] memory cts = new uint256[](1);
    cts[0] = Gateway.toUint256(proposals[index].voteCount);
    Gateway.requestDecryption(cts, this.callbackSecret.selector, 0, block.timestamp + 100, false);
   }
   function callbackSecret(uint256, uint16 decryptedValue) public onlyGateway {
       revealedSecret = decryptedValue;
   }


   function onVoteCountDecrypted(uint64 requestId, uint16 decryptedVoteCount) public onlyGateway {
        emit VoteCountDecrypted(requestId, decryptedVoteCount);
   }

   event VoteCountDecrypted(uint64 requestId, uint16 decryptedVoteCount);

    function castVote(einput value1, einput value2, einput value3, bytes calldata inputProof) external {
        require(isActive(), "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");
        _processVotes(TFHE.asEbool(value1, inputProof),TFHE.asEbool(value2, inputProof),TFHE.asEbool(value3, inputProof)); // Each vote counts as 1
        hasVoted[msg.sender] = true;
    }

    // Internal function to process votes
    function _processVotes(ebool prop1, ebool prop2, ebool prop3) internal {
            proposals[0].voteCount = TFHE.add(proposals[0].voteCount,TFHE.asEuint16(prop1));
            proposals[1].voteCount = TFHE.add(proposals[1].voteCount,TFHE.asEuint16(prop2));
            proposals[2].voteCount = TFHE.add(proposals[2].voteCount,TFHE.asEuint16(prop3));
            TFHE.allowThis(proposals[0].voteCount);
            TFHE.allowThis(proposals[1].voteCount);
            TFHE.allowThis(proposals[2].voteCount);
    }
    
    function isActive() public view returns (bool) {
        return block.timestamp < startTime + duration;
    }

    function finishBallot() public {
        require(!isActive(), "Ballot is still ongoing");
        ballotFinished = true;
    }

    function get_ballot_status() public view returns (bool) {
        return ballotFinished;
    }


}