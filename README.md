<h1 align="center"> 🤫 conFHE 🤫</h1>
  <h4 align="center">Built for Aleph de Verano Hackathon !</h4>

<h4 align="center">
  <a href="https://www.canva.com/design/DAGM5T86daQ/HCFXclyE3jIqX7A-uA68hw/edit?utm_content=DAGM5T86daQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton">Slides</a> |
  <a href="https://drive.google.com/drive/">Demo</a>
</h4>

### About

🧪 This is a draft for a voting dApp designed to facilitate use Fully Homomorphic Encryption for secure voting. By leveraging the fhevm encrypted data types, this dApp ensures voting data integrity, privacy and process transparency.

⚙️ Built using React, Hardhat, Wagmi, Viem, and Typescript.

- **Secure and Transparent**: Ensures votes are securely recorded on the blockchain and visible for verification only after the voting process is finished.

- **No Trusted Coordinator**: The system does not rely on a trusted third party to coordinate the election or manage votes.

- **Result Disclosure**: Results are only available once the election has ended. No one can decrypt individual votes.

- This particular implementation serves as a demonstration, as a contract needs to be deployed for each ballot, in a real world use case there are a lot of constrains that should be prepared via a ballot factory contract for example to config the ballot acoordingly.

## How to use this repo

You can either deploy the dApp on the real fhEVM coprocessor on the Ethereum Sepolia testnet, or on a local Hardhat node (i.e a mocked corpocessor).

### Disclaimer
This application is for experimental purposes only and should not be used in a production environment.

The current implementation makes several assumptions to work around the limitations presented.



### How to deploy on Sepolia

First, before launching the React app, you must deploy the `ConfidentialERC20` smart contract and mint the first few tokens.
To do this, go to the `hardhat/` directory, and follow all the instructions from the [`README`](/hardhat/README.md) there to deploy and mint the first tokens with Alice's account, i.e until you are able to run the following command:

```
npm run deploy-sepolia
```

> **Note:** Be careful to use your own private mnemonic key in this case, in the `.env` file (do not reuse the public values from `.env.example`!).

After you succesfully run the Sepolia deployment script, go to the `frontend/` directory, and just run those two commands:

```
npm install
npm run dev
```

This will launch the front-end of the dApp from a local Vite server, which will be available at the following URL: [`http://localhost:4173/`](http://localhost:4173/) . You can connect to the dApp with a Web3 wallet such as Metamask and start transferring tokens, reencrypt and read your balance, or request the decryption of the encrypted secret on Sepolia.

### How to use in Mocked mode

First go to the `hardhat/` directory : define a new `.env` file - in mocked mode, simply doing a copy `cp .env.example .env` is doable, but you can also you your own private mnemonic - then install all packages with
`npm i`. Now you can launch the hardhat local node with:

```
npx hardhat node
```

This will also launch a mocked instance of the coprocessor.

You can then go to the `frontend/` directory, and just run those two commands:

```
npm install
npm run dev-mocked
```

The dApp will be available again at: [`http://localhost:4173/`](http://localhost:4173/) . You can connect to the dApp with a Web3 wallet such as Metamask and start transferring tokens, reencrypt and read your balance, or request the decryption of the encrypted. This time, the only difference is that it will ask you to connect to the Hardhat network instead of Sepolia, so make sure to have added the Hardhat network to your Metamask wallet in order to be able to use the dApp with the mocked coprocessor. You can find instructions to configure Metamask adequatly [here](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node).

#### Troubleshooting

**_Invalid nonce errors:_** This is a common issue everytime you restart your local Hardhat node and you want to reuse the same accounts in Metamask. You should remember to reset the nonce of the accounts you used the last time with Hardhat. To reset the account's transaction history and the nonce, open Metamask and select the Hardhat network, click on your account followed by `Settings -> Advanced -> Clear activity tab data`.
