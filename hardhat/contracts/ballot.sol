
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
        euint16 voteCount; // Encrypted vote count
    }
    mapping(euint16 => Proposal) public proposals;
    mapping(address => bool) public hasVoted;

    euint16 eOne;
    euint16 eZero;

    uint256 public startTime;
    uint256 public duration;
    uint16 public proposalCount;
    bool public ballotFinished;

    constructor(uint16 _duration) {
        eOne = TFHE.asEuint16(1);
        eZero = TFHE.asEuint16(0);
        startTime = 0;
        duration = _duration;
        proposalCount = 0;
        ballotFinished = false;
    }

    function createProposal(string memory proposalName) public {
        require(startTime == 0, "Ballot has already started - cannot add new proposals");
        // Encrypt the current proposal count
        euint16 encryptedIndex = TFHE.asEuint16(proposalCount);
        proposals[encryptedIndex] = Proposal({name: proposalName, voteCount: eZero});
        proposalCount++;
    }


    function getProposal(euint16 _encryptedIndex) public view returns (Proposal memory) {
        return proposals[_encryptedIndex];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

    function vote(euint16 eProposalIndex) public {
        
        require(isActive(), "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");
        
        for (uint16 i = 0; i < proposalCount; i++) {
            euint16 ei = TFHE.asEuint16(i);
            ebool isEqual = TFHE.eq(eProposalIndex, ei);


            // Using ternary element select to increment the vote count of the selected proposal
            proposals[ei].voteCount = TFHE.add(
                proposals[ei].voteCount,
                TFHE.select(isEqual, eOne, eZero)
            );
        }


        hasVoted[msg.sender] = true;
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

    function get_result() public returns (string memory proposalName) {
        require(ballotFinished, "Ballot is not finished");
        euint16 maxVotes = eZero;
        euint16 maxIndex;



        for (uint16 i = 0; i < proposalCount; i++) {
            euint16 ei = TFHE.asEuint16(i);
            euint16 currentVotes = proposals[ei].voteCount;
            ebool isHigher = TFHE.gt(currentVotes, maxVotes);
            maxVotes = TFHE.select(isHigher, currentVotes, maxVotes);
            maxIndex = TFHE.select(isHigher, ei, maxIndex);
        }   
        return proposals[maxIndex].name;

        // TODO: decide what to return/decrypt

    }
}   