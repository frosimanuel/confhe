export const CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

import BallotABI from '@deployments/sepolia/Ballot.json';
export const CONTRACT_ABI = BallotABI;

export const NETWORK = {
  name: 'Sepolia',
  chainId: 11155111,
  rpcUrl:
    process.env.REACT_APP_SEPOLIA_RPC_URL ||
    'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
};

export const TRANSACTION_TIMEOUT = 120000;

// Mensajes para el usuario
export const MESSAGES = {
  CONNECT_WALLET: 'Conecta tu wallet para empezar.',
  TRANSACTION_PENDING: 'Transacción en progreso, por favor espera...',
  TRANSACTION_SUCCESS: 'Transacción completada con éxito!',
  TRANSACTION_FAILED: 'Algo salió mal. Intenta de nuevo.',
};

// Dirección del Gateway de FHE (si es relevante)
export const FHE_GATEWAY_URL = 'https://gateway.zama.ai';
