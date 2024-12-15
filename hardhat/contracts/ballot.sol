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

    euint16 eOne;
    euint16 eZero;

    uint256 public startTime;
    uint16 public duration;
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
        proposals[proposalCount] = Proposal({name: proposalName, voteCount: eZero});
        proposalCount++;
    }

    function getProposal(uint16 _index) public view returns (Proposal memory) {
        return proposals[_index];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

    /*function vote(uint16 _proposal) public {
        require(isActive(), "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");
        
        for (uint16 i = 0; i < proposalCount; i++) {
            if (i == _proposal) {
                proposals[i].voteCount += 1; //eOne
            } else {
                proposals[i].voteCount += 0; //eZero
            }
        }
    }*/

    function castVote(uint16 _index, einput _vote, bytes calldata inputProof) public {
        
        require(isActive(), "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");

        ebool vote = TFHE.asEbool(_vote, inputProof);

        Proposal memory proposal = proposals[_index];
        //retorna algo?

        for (uint16 i = 0; i < proposalCount; i++) {
        proposal.voteCount = TFHE.select(vote, TFHE.add(proposal.voteCount, eOne), TFHE.add(proposal.voteCount, eZero));
            
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

    /*function get_result() public view returns (Proposal memory) {
        require(ballotFinished, "Ballot is not finished");
        uint16 maxVotes = 0;
        uint16 maxIndex = 0;
        for (uint16 i = 0; i < proposalCount; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                maxIndex = i;
            }
        }
        return proposals[maxIndex];
    }*/
}