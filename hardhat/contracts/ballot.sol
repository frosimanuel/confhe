
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
        euint64 voteCount; // Encrypted vote count
    }
    mapping(euint64 => Proposal) public proposals;
    mapping(address => bool) public hasVoted;

    euint4 eOne;
    euint4 eZero;

    uint256 public startTime;
    uint256 public duration;
    uint256 public proposalCount;
    bool public ballotFinished;

    constructor(uint256 _duration) {
        eOne = TFHE.asEuint4(1);
        eZero = TFHE.asEuint4(0);
        startTime = 0;
        duration = _duration;
        proposalCount = 0;
        ballotFinished = false;
    }

    function createProposal(string memory proposalName) public {
        require(startTime == 0, "Ballot has already started - cannot add new proposals");
        // Encrypt the current proposal count
        euint64 encryptedIndex = TFHE.asEuint64(proposalCount);
        proposals[encryptedIndex] = Proposal({name: proposalName, voteCount: eZero});
        proposalCount++;
    }


    function getProposal(uint256 _encryptedIndex) public view returns (Proposal memory) {
        return proposals[_encryptedIndex];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

    function vote(euint64 encryptedProposalIndex) public {
        require(isActive(), "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");
        
        for (uint64 i = 0; i < proposalCount; i++) {
            if (i == encryptedProposalIndex) {
                proposals[i].voteCount = TFHE.add(
                    proposals[i].voteCount,
                    eOne
                );
            } else {
                proposals[i].voteCount = TFHE.add(
                    proposals[i].voteCount,
                    eZero
                );
            }
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

    function get_result() public view returns (Proposal memory) {
        require(ballotFinished, "Ballot is not finished");
        euint64 maxVotes = eZero;
        euint64 maxIndex;

        for (uint64 i = 0; i < proposalCount; i++) {
            euint64 currentVotes = proposals[i].voteCount;
            ebool isHigher = TFHE.gt(currentVotes, maxVotes);
            maxVotes = TFHE.select(isHigher, currentVotes, maxVotes);
            maxIndex = TFHE.select(isHigher, i, maxIndex);
        }   

        // TODO: decide what to return/decrypt

    }
}   