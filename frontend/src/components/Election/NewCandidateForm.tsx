import React from 'react';

interface NewCandidateFormProps {
  newCandidate: {
    name: string;
    party: string;
    proposals: string[];
  };
  handleNewCandidateChange: (field: string, value: string | string[]) => void;
  addProposal: () => void;
  createNewCandidate: () => void;
  startElection: () => void;
  candidatesCount: number;
}

export const NewCandidateForm: React.FC<NewCandidateFormProps> = ({
  newCandidate,
  handleNewCandidateChange,
  addProposal,
  createNewCandidate,
  startElection,
  candidatesCount,
}) => {
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
        <button onClick={createNewCandidate}>Add Candidate</button>
        <button onClick={startElection} disabled={candidatesCount <= 1}>
          Start Election
        </button>
      </div>
    </div>
  );
};
