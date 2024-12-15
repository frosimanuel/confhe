import React, { useState } from 'react';
import {
  useCreateProposal,
  useStartBallot,
} from '../../hooks/useBallotContract';

interface NewCandidateFormProps {
  newCandidate: {
    name: string;
    party: string;
    proposals: string[];
  };
  handleNewCandidateChange: (field: string, value: string | string[]) => void;
  addProposal: () => void;
  createNewCandidate: () => void;
  candidatesCount: number;
}

export const NewCandidateForm: React.FC<NewCandidateFormProps> = ({
  newCandidate,
  handleNewCandidateChange,
  addProposal,
  createNewCandidate,
  candidatesCount,
}) => {
  const { createProposal } = useCreateProposal(); // Hook para crear propuestas
  const {
    startBallot,
    loading: startingBallot,
    error: startBallotError,
  } = useStartBallot(); // Hook para iniciar el ballot

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party) {
      alert('Please provide both a name and a party for the candidate.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createProposal(newCandidate.name); // Llama al contrato para crear la propuesta
      createNewCandidate(); // Actualiza el estado local
      alert(`Candidate "${newCandidate.name}" added successfully!`);
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError('Failed to add candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async () => {
    if (candidatesCount <= 1) {
      alert('Please add at least two candidates to start the election.');
      return;
    }

    try {
      await startBallot(); // Llama al contrato para iniciar el ballot
      alert('Election started successfully!');
    } catch (err) {
      console.error('Error starting election:', err);
      alert('Failed to start the election. Please try again.');
    }
  };

  return (
    <div className="new-candidate-form">
      <h2 className="form-title">Add a New Candidate</h2>
      <div className="form-group">
        <label htmlFor="candidate-name">Candidate Name:</label>
        <input
          id="candidate-name"
          type="text"
          placeholder="Enter candidate's name"
          value={newCandidate.name}
          onChange={(e) => handleNewCandidateChange('name', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="party-name">Party Name:</label>
        <input
          id="party-name"
          type="text"
          placeholder="Enter party name"
          value={newCandidate.party}
          onChange={(e) => handleNewCandidateChange('party', e.target.value)}
        />
      </div>
      <div className="form-group proposals-group">
        <label>Proposals:</label>
        {newCandidate.proposals.map((proposal, index) => (
          <div key={index} className="proposal-input-wrapper">
            <input
              type="text"
              placeholder={`Proposal ${index + 1}`}
              value={proposal}
              onChange={(e) => {
                const updatedProposals = [...newCandidate.proposals];
                updatedProposals[index] = e.target.value;
                handleNewCandidateChange('proposals', updatedProposals);
              }}
            />
          </div>
        ))}
        <button onClick={addProposal}>+ Add Proposal</button>
      </div>
      <div className="form-buttons">
        <button onClick={handleAddCandidate} disabled={loading}>
          {loading ? 'Adding Candidate...' : 'Add Candidate'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          onClick={handleStartElection}
          disabled={startingBallot || candidatesCount <= 1}
        >
          {startingBallot ? 'Starting Election...' : 'Start Election'}
        </button>
        {startBallotError && <p style={{ color: 'red' }}>{startBallotError}</p>}
      </div>
    </div>
  );
};
