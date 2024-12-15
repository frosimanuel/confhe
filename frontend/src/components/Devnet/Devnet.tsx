import { useEffect, useState } from 'react';
import './Devnet.css';
import { Eip1193Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';

export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
  onConnectionSuccess: () => void;
};

export const Devnet = ({
  account,
  provider,
  onConnectionSuccess,
}: DevnetProps) => {
  const [contractAddress, setContractAddress] = useState(ZeroAddress);

  useEffect(() => {
    const loadData = async () => {
      try {
        let MyConfidentialERC20;
        if (!import.meta.env.MOCKED) {
          MyConfidentialERC20 = await import(
            '@deployments/sepolia/MyConfidentialERC20.json'
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Sepolia`,
          );
        } else {
          MyConfidentialERC20 = await import(
            '@deployments/localhost/MyConfidentialERC20.json'
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Hardhat Local Node`,
          );
        }

        setContractAddress(MyConfidentialERC20.address);
        alert('Conexión exitosa');
        onConnectionSuccess();
      } catch (error) {
        console.error(
          'Error loading data - you probably forgot to deploy the token contract before running the front-end server:',
          error,
        );
      }
    };

    loadData();
  }, [onConnectionSuccess]);

  const getHandleBalance = async () => {
    if (contractAddress !== ZeroAddress) {
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider,
      );
      const handleBalance = await contract.balanceOf(account);
      setHandleBalance(handleBalance.toString());
      setDecryptedBalance('???');
    }
  };

  useEffect(() => {
    getHandleBalance();
  }, [account, provider, contractAddress]);

  return null;
};
