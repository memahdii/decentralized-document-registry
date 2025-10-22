## Decentralized Document Registry

A monorepo containing a Solidity smart contract and a React frontend for registering documents on-chain while storing the file itself on IPFS. The on-chain registry keeps an immutable record of the document's IPFS content hash and associated metadata (category, optional deadline, owner, timestamp).

### Repository Layout
- `doc-registry/`: Hardhat 3 project with the `DocumentRegistry` contract and Ignition deployment module
- `frontend/`: React + TypeScript + Vite dApp that uploads files to IPFS and records metadata on-chain

### Prerequisites
- Node.js 20+
- npm 9+
- A modern browser with MetaMask (or any EVM wallet injected provider)

Optional for testnets:
- A funded account on your target testnet (e.g., Sepolia)

### Quick Start (Local)
1) Install dependencies

```bash
cd /home/md/Desktop/github/decentralized-document-registry/doc-registry && npm i
cd /home/md/Desktop/github/decentralized-document-registry/frontend && npm i
```

2) Start a local Hardhat node

```bash
cd /home/md/Desktop/github/decentralized-document-registry/doc-registry
npx hardhat node
```

3) In a new terminal, deploy the contract using Ignition

```bash
cd /home/md/Desktop/github/decentralized-document-registry/doc-registry
npx hardhat ignition deploy ignition/modules/DeployRegistry.ts
```

This will output a deployed address for `DocumentRegistry`. The local chain id is typically `31337`.

4) Start the frontend

```bash
cd /home/md/Desktop/github/decentralized-document-registry/frontend
npm run dev
```

5) Connect your wallet
- Open the app (shown in the terminal output from the previous step)
- Connect MetaMask and switch to the Hardhat local network (chain id `31337`)

### Frontend Notes
- The frontend lets you:
  - Upload a file to IPFS (via Pinata or a configured gateway)
  - Register the file's IPFS hash and metadata on-chain in `DocumentRegistry`
  - Browse and filter registered documents
  - Open files through a public IPFS gateway

If you deploy to a different network or redeploy locally, ensure the app points to the correct `DocumentRegistry` address. The project ships with a `DocumentRegistry.json` artifact in `frontend/src/` that you can update or replace with the latest build output if needed.

### Contract Overview
- `doc-registry/contracts/DocumentRegistry.sol`: Stores for each document the IPFS content hash and metadata (category, optional deadline, owner, timestamp). It emits events and exposes read helpers to list or filter documents.

### Deploying to Sepolia (optional)
You can deploy using Hardhat Ignition. Set a private key for the account that will deploy on Sepolia.

```bash
cd /home/md/Desktop/github/decentralized-document-registry/doc-registry
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy --network sepolia ignition/modules/DeployRegistry.ts
```

Record the deployed contract address and configure the frontend to use it.

### Common Commands
Hardhat (from `doc-registry/`):

```bash
npx hardhat node                  # Start local chain
npx hardhat compile               # Compile contracts
npx hardhat test                  # Run tests (if present)
npx hardhat ignition deploy ignition/modules/DeployRegistry.ts
```

Frontend (from `frontend/`):

```bash
npm run dev       # Local development server
npm run build     # Production build
npm run preview   # Preview production build
```

### Troubleshooting
- Wallet not connecting: Ensure you're on chain id `31337` when using the local Hardhat node.
- Contract not found: Redeploy locally and update the frontend to point at the latest `DocumentRegistry` address. Clear any cached artifacts if necessary.
- IPFS file not loading: Try a different public gateway or verify that your pinning service (e.g., Pinata) successfully pinned the file.

### License
This repository is provided as-is for educational purposes. See individual subfolders for any specific license files.


