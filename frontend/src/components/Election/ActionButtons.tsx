import React from 'react';

interface ActionButtonsProps {
  selectedCandidate: number | null;
  hasVoted: boolean;
  handleVote: () => void;
  finalizeVoting: () => void;
  logVoteRequests: (candidateId: number | null) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedCandidate,
  hasVoted,
  handleVote,
  finalizeVoting,
  logVoteRequests,
}) => {
  const handleVoteClick = () => {
    if (selectedCandidate !== null) {
      logVoteRequests(selectedCandidate); // Realiza las solicitudes al presionar "Vote"
      handleVote(); // Registra el voto
    }
  };

  return (
    <div className="buttons-section">
      <button
        className={`vote-button ${selectedCandidate !== null && !hasVoted ? '' : 'disabled'}`}
        onClick={handleVoteClick}
        disabled={selectedCandidate === null || hasVoted}
      >
        Vote
      </button>
      <button className="finalize-button" onClick={finalizeVoting}>
        Finalize Voting
      </button>
    </div>
  );
};
