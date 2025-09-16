## 1. Project Summary (What You Have Done)
I built a full-stack decentralized application (dApp) called the “Decentralized Document Registry.”

The purpose of this project is to allow users to securely register important documents. It achieves this by using a hybrid storage model:
- It stores the actual document file on a decentralized network called IPFS.
- It then records the proof-of-existence—essential metadata like the owner, a category, and a unique hash of the file—on the Ethereum blockchain via a smart contract.

This approach provides a verifiable, tamper-proof record on the blockchain while keeping the storage of large files efficient and cost-effective.

## 2. Technologies Used
You can break down the technologies into four main categories:

### Backend (The Smart Contract)
- Solidity: The primary programming language used to write the smart contract, which is the standard for the Ethereum ecosystem.
- Hardhat: A professional development environment used to compile, test, deploy, and manage the smart contract’s lifecycle. It also runs a local blockchain node for testing.
- Ethereum Virtual Machine (EVM): The runtime environment where the Solidity code executes (locally simulated by Hardhat).

### Decentralized Storage
- IPFS (InterPlanetary File System): A peer-to-peer network for storing files in a distributed way. Unlike a traditional server, files are addressed by their content (using a unique hash), not their location.
- Pinata: An IPFS pinning service. We used Pinata as an easy-to-use gateway to upload files to IPFS and to ensure they remain available (“pinned”).

### Frontend (The User Interface)
- React: A popular JavaScript library used to build the interactive web UI.
- TypeScript: A superset of JavaScript that adds static typing for a more robust development experience.
- Vite: A modern, fast build tool used to develop and serve the React app.
- Viem: A lightweight and efficient TypeScript library used to communicate with the Ethereum blockchain. It bridges the website to MetaMask and smart contract calls.

### Wallet & Connection
- MetaMask: A browser-based crypto wallet that users need to interact with the dApp. It securely manages their accounts and private keys, and is used to sign and approve transactions.

## 3. The Workflow (How It All Works)
Here is the step-by-step flow of how a user interacts with the dApp:

1) Connect Wallet: A user arrives at the web application and clicks “Connect Wallet.” MetaMask prompts them to approve the connection. Once approved, the website can see their public wallet address.

2) Prepare Document: The user fills out the form on the website, entering metadata like “Category” and selecting a file from their computer.

3) Upload to IPFS: When the user clicks “Register Document,” the first action happens off-chain. The frontend sends the selected file to Pinata, which adds the file to the IPFS network and returns a unique IPFS Hash (CID).

4) Create Transaction: The frontend then takes this IPFS Hash and the other metadata from the form and uses Viem to construct a transaction that calls the `uploadDocument` function on the smart contract.

5) Sign Transaction: This transaction request is sent to MetaMask. MetaMask pops up and asks the user to review and confirm the transaction (including the gas fee). The user signs it with their private key, authorizing the action.

6) Confirm on Blockchain: Once confirmed, the transaction is sent to the blockchain. When it’s mined and validated by the network, the document’s metadata and its IPFS hash are permanently and immutably stored inside the smart contract. The application then shows a success message with the transaction hash.


## 4. Quickstart

### Prerequisites
- Node.js 18+ and npm
- MetaMask (browser extension)
- Pinata account (for IPFS uploads)

### 4.1. Clone and install
```bash
git clone <this-repo-url>
cd decentralized-document-registry

# Install backend deps
cd doc-registry
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 4.2. Start a local blockchain and deploy
```bash
# In one terminal: start a local Hardhat node (if you want logs, run `npx hardhat node`)
cd doc-registry
npx hardhat node
```

Open a second terminal:
```bash
# Compile
cd doc-registry
npx hardhat compile

# Deploy DocumentRegistry via Ignition to localhost
npx hardhat ignition deploy ./ignition/modules/DeployRegistry.ts --network localhost
```

Note: The default local address in the frontend is `0x5FbDB2315678afecb367f032d93F642f64180aa3`. If your deployment prints a different address, update it in the frontend (see next step).

### 4.3. Configure the frontend
- Open `frontend/src/App.tsx` and set:
  - `contractAddress` to the deployed `DocumentRegistry` address.
  - Replace the demo `PINATA_JWT` with your own (or remove and proxy via a backend for security).

### 4.4. Run the frontend
```bash
cd frontend
npm run dev
```
- Open the URL shown (typically `http://localhost:5173`).
- In MetaMask, add/switch to the Hardhat network (the app auto-prompts). Chain ID: 31337, RPC: `http://127.0.0.1:8545`.

### 4.5. Use the app
1) Click “Connect Wallet”.
2) Fill Category/Authors/Deadline and choose a file.
3) Click “Register Document”:
   - File is pinned to IPFS via Pinata → returns a CID.
   - Transaction calls `uploadDocument(CID, ...)` on-chain.
4) See the new row in “Documents” with IPFS links.

## 5. Testing and scripts

### 5.1. Run tests (Counter example)
```bash
cd doc-registry
npx hardhat test
```

### 5.2. Optional: OP-style transaction demo
```bash
cd doc-registry
npx ts-node --swc scripts/send-op-tx.ts
```

## 6. Environment variables (optional, for Sepolia etc.)
Create `.env` (if deploying beyond localhost) and export as needed:
```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/<your-key>"
export SEPOLIA_PRIVATE_KEY="0x<private-key>"
```
Then:
```bash
npx hardhat ignition deploy ./ignition/modules/DeployRegistry.ts --network sepolia
```

## 7. Security notes
- Do not ship a Pinata JWT in the frontend. Prefer a simple backend proxy or delegated upload keys.
- Avoid hardcoding the contract address in production. Load from deployment artifacts or env at build time.