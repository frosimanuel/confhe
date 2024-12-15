import React, { useState } from 'react';
import { useCastVote, useFinishBallot } from '../../hooks/useBallotContract';
import { generateVoteProof } from '../../fhevmjs';

interface ActionButtonsProps {
  selectedCandidate: number | null;
  hasVoted: boolean;
  handleVote: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedCandidate,
  hasVoted,
  handleVote,
}) => {
  const { castVote } = useCastVote();
  const {
    finishBallot,
    loading: finishingBallot,
    error: finishBallotError,
  } = useFinishBallot();

  const [votingError, setVotingError] = useState<string | null>(null);

  const handleVoteClick = async () => {
    if (selectedCandidate !== null) {
      try {
        console.log('Generating boolean votes...');
        const votes: boolean[] = [false, false, false];
        votes[selectedCandidate] = true; // Marca solo el candidato seleccionado

        console.log('Generating vote proof...');
        const { proof, encryptedInputs } = await generateVoteProof(
          votes,
          '0x86093b5731BadDdA9C46E13c05D510e28D39F8dF', // Dirección hardcodeada
        );

        console.log('Vote proof and encrypted inputs generated:', {
          proof,
          encryptedInputs,
        });

        await castVote(encryptedInputs, proof);
        handleVote();
      } catch (error: any) {
        console.error('Error during vote process:', error);
        setVotingError(error.message || 'Failed to cast vote.');
      }
    }
  };

  const handleFinalizeVoting = async () => {
    try {
      await finishBallot(); // Llama al contrato para finalizar la votación
      alert('Voting has been finalized!');
    } catch (error) {
      console.error('Error finalizing voting:', error);
    }
  };

  return (
    <div className="buttons-section">
      <button
        className={`vote-button ${
          selectedCandidate !== null && !hasVoted ? '' : 'disabled'
        }`}
        onClick={handleVoteClick}
        disabled={selectedCandidate === null || hasVoted}
      >
        Vote
      </button>
      <button
        className="finalize-button"
        onClick={handleFinalizeVoting}
        disabled={finishingBallot}
      >
        {finishingBallot ? 'Finalizing...' : 'Finalize Voting'}
      </button>
      {votingError && <p style={{ color: 'red' }}>{votingError}</p>}
      {finishBallotError && <p style={{ color: 'red' }}>{finishBallotError}</p>}
    </div>
  );
};
