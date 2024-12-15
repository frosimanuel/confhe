import React from 'react';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  votes: number;
}

interface ElectionResultsProps {
  candidates: Candidate[];
  resetElection: () => void;
  getVotePercentage: (votes: number, totalVotes: number) => string;
}

export const ElectionResults: React.FC<ElectionResultsProps> = ({
  candidates,
  resetElection,
  getVotePercentage,
}) => {
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="results-section">
      <h2>Election Results</h2>
      <ul className="results-list">
        {candidates.map((candidate) => (
          <li key={candidate.id} className="result-item">
            {candidate.icon} {candidate.name} ({candidate.party}):{' '}
            {candidate.votes} votes ({getVotePercentage(candidate.votes, totalVotes)})
          </li>
        ))}
      </ul>
      <button onClick={resetElection}>Reset Election</button>
    </div>
  );
};
