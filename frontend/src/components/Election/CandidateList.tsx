import React from 'react';
import { motion } from 'framer-motion';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  proposals: string[];
  votes: number;
}

interface CandidateListProps {
  candidates: Candidate[];
  selectedCandidate: number | null;
  setSelectedCandidate: (id: number | null) => void;
  hasVoted: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  selectedCandidate,
  setSelectedCandidate,
  hasVoted,
}) => {
  return (
    <motion.ul
      className="candidate-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {candidates.map((candidate) => (
        <motion.li
          key={candidate.id}
          className={`candidate ${
            selectedCandidate === candidate.id ? 'selected' : ''
          } ${hasVoted ? 'disabled-candidate' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCandidate(candidate.id)}
        >
          <div className="candidate-header">
            <span className="candidate-icon">{candidate.icon}</span>
            <div className="candidate-info">
              <span className="candidate-name">{candidate.name}</span>
              <span className="candidate-party">{candidate.party}</span>
            </div>
          </div>
          <ul className="candidate-proposals">
            {candidate.proposals.map((proposal, index) => (
              <li key={index}>{proposal}</li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ul>
  );
};
