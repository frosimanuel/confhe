import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, Signer } from 'ethers';
import BallotABI from '@deployments/sepolia/Ballot.json';
import { CONTRACT_ADDRESS } from '../constants/constants';

export const useBallotContract = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const web3Provider = new BrowserProvider(window.ethereum);
        const userSigner = await web3Provider.getSigner();
        const ballotContract = new Contract(
          CONTRACT_ADDRESS,
          BallotABI,
          userSigner,
        );

        setProvider(web3Provider);
        setSigner(userSigner);
        setContract(ballotContract);
      } else {
        console.error('Ethereum wallet not found!');
      }
    };

    initContract();
  }, []);

  return { provider, signer, contract };
};

export const useCreateProposal = () => {
  const { contract } = useBallotContract();

  const createProposal = async (name: string) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const tx = await contract.createProposal(name);
      await tx.wait();
      console.log(`Proposal ${name} created successfully!`);
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  return { createProposal };
};

export const useGetProposal = () => {
  const { contract } = useBallotContract();

  const getProposal = async (index: number) => {
    if (!contract) {
      console.error('Contract not initialized');
      return null;
    }
    try {
      const proposal = await contract.getProposal(index);
      return proposal;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  };

  return { getProposal };
};

export const useCastVote = () => {
  const { contract } = useBallotContract();

  const castVote = async (votes: boolean[], proof: string) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const tx = await contract.castVote(votes[0], votes[1], votes[2], proof);
      await tx.wait();
      console.log('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  return { castVote };
};

export const useDecryptVoteCount = () => {
  const { contract } = useBallotContract();

  const decryptVoteCount = async (proposalIndex: number) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const tx = await contract.decryptedVoteCount(proposalIndex);
      await tx.wait();
      console.log('Decryption request sent!');
    } catch (error) {
      console.error('Error decrypting vote count:', error);
    }
  };

  return { decryptVoteCount };
};

export const useBallotStatus = () => {
  const { contract } = useBallotContract();

  const getBallotStatus = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return false;
    }
    try {
      const status = await contract.get_ballot_status();
      return status;
    } catch (error) {
      console.error('Error fetching ballot status:', error);
      return false;
    }
  };

  return { getBallotStatus };
};
