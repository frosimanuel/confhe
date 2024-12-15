<h1 align="center"> 🤫 conFHE 🤫</h1>
  <h4 align="center">Built for Aleph de Verano Hackathon !</h4>

### About

🧪 This is a draft for a voting dApp designed to facilitate use Fully Homomorphic Encryption for secure voting. By leveraging the fhevm encrypted data types, this dApp ensures voting data integrity, privacy and process transparency.

⚙️ Built using React, Hardhat, Wagmi, Viem, and Typescript.

- **Secure and Transparent**: Ensures votes are securely recorded on the blockchain and visible for verification only after the voting process is finished.

- **No Trusted Coordinator**: The system does not rely on a trusted third party to coordinate the election or manage votes.

- **Result Disclosure**: Results are only available once the election has ended. No one can decrypt individual votes.

- This particular implementation serves as a demonstration, as a contract needs to be deployed for each ballot, in a real world use case there are a lot of constrains that should be prepared via a ballot factory contract for example to config the ballot acoordingly.
