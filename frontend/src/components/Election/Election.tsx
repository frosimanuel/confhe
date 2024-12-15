import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ElectionHeader } from './ElectionHeader';
import { CandidateList } from './CandidateList';
import { ElectionResults } from './ElectionResults';
import { NewCandidateForm } from './NewCandidateForm';
import { ActionButtons } from './ActionButtons';
import './Election.css';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  proposals: string[];
  votes: number;
}

const candidatesInitial: Candidate[] = [
  {
    id: 1,
    name: 'Candidate A',
    party: 'Party X',
    icon: '👩‍💼',
    proposals: [
      'Reduce taxes by 15%',
      'Promote green energy initiatives',
      'Expand education access for all',
    ],
    votes: 0,
  },
  {
    id: 2,
    name: 'Candidate B',
    party: 'Party Y',
    icon: '👨‍💼',
    proposals: [
      'Increase healthcare funding',
      'Boost small business loans',
      'Develop advanced public transportation',
    ],
    votes: 0,
  },
  {
    id: 3,
    name: 'Candidate C',
    party: 'Party Z',
    icon: '🧑‍⚖️',
    proposals: [
      'Ensure cybersecurity for all',
      'Increase AI research funding',
      'Expand digital literacy programs',
    ],
    votes: 0,
  },
];

export const Election: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [isActive, setIsActive] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesInitial);
  const [showForm, setShowForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    proposals: [''],
  });
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const getVotePercentage = (votes: number, totalVotes: number): string => {
    if (totalVotes === 0) return '0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  useEffect(() => {
    const electionEndTime = new Date('2024-12-15T23:59:59').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = Math.max(
        0,
        Math.floor((electionEndTime - now) / 1000),
      );
      setTimeLeft(difference);

      if (difference <= 0) {
        clearInterval(interval);
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const logVoteRequests = (candidateId: number | null) => {
    if (candidateId === null) return;

    candidates.forEach((candidate, index) => {
      const isVoted = candidate.id === candidateId;

      setTimeout(() => {
        console.log(`Index: ${index}, Voted: ${isVoted}`);
        simulateRequest(index, isVoted);
      }, index * 500);
    });
  };

  const simulateRequest = (index: number, isVoted: boolean) => {
    console.log(`Simulating request -> Index: ${index}, Voted: ${isVoted}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleVote = () => {
    if (selectedCandidate !== null && !hasVoted) {
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedCandidate
            ? { ...candidate, votes: candidate.votes + 1 }
            : candidate,
        ),
      );
      setSelectedCandidate(null);
      setHasVoted(true);
    }
  };

  const finalizeVoting = () => {
    setIsActive(false);
    alert('Voting has been finalized!');
  };

  const resetElection = () => {
    setCandidates([]);
    setNewCandidate({ name: '', party: '', proposals: [''] });
    setShowForm(true);
    setIsActive(false);
    setHasVoted(false);
  };

  const startElection = () => {
    if (candidates.length > 0) {
      setIsActive(true);
      setShowForm(false);
      alert('Election has started!');
    } else {
      alert('Please add at least one candidate to start the election!');
    }
  };

  const handleNewCandidateChange = (
    field: string,
    value: string | string[],
  ) => {
    setNewCandidate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProposal = () => {
    setNewCandidate((prev) => ({
      ...prev,
      proposals: [...prev.proposals, ''],
    }));
  };

  const createNewCandidate = () => {
    if (newCandidate.name && newCandidate.party) {
      setCandidates((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: newCandidate.name,
          party: newCandidate.party,
          icon: '🆕',
          proposals: newCandidate.proposals.filter((p) => p.trim() !== ''),
          votes: 0,
        },
      ]);
      setNewCandidate({ name: '', party: '', proposals: [''] });
      alert('New candidate has been added!');
    } else {
      alert('Please fill in all required fields!');
    }
  };

  return (
    <motion.div
      className="election-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ElectionHeader
        isActive={isActive}
        timeLeft={timeLeft}
        formatTime={formatTime}
      />

      {hasVoted && (
        <motion.div
          className="vote-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>You have voted! 🎉</p>
        </motion.div>
      )}

      {isActive ? (
        <CandidateList
          candidates={candidates}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          hasVoted={hasVoted}
        />
      ) : (
        <ElectionResults
          candidates={candidates}
          resetElection={resetElection}
          getVotePercentage={getVotePercentage}
        />
      )}

      {isActive && (
        <ActionButtons
          selectedCandidate={selectedCandidate}
          hasVoted={hasVoted}
          handleVote={handleVote}
          finalizeVoting={finalizeVoting}
          logVoteRequests={logVoteRequests}
        />
      )}

      {showForm && (
        <NewCandidateForm
          newCandidate={newCandidate}
          handleNewCandidateChange={handleNewCandidateChange}
          addProposal={addProposal}
          createNewCandidate={createNewCandidate}
          startElection={startElection}
          candidatesCount={candidates.length}
        />
      )}
    </motion.div>
  );
};
