## Document Registry dApp (Frontend)

Purpose: lets users upload any file to IPFS (via Pinata) and record the file's IPFS hash plus metadata (category, optional deadline, owner, timestamp) on-chain in the `DocumentRegistry` smart contract. This establishes immutable proof of existence/ownership and enables later discovery via simple queries.

What you can do now
- Connect MetaMask to Hardhat local network.
- Upload a file to IPFS; then confirm an on-chain transaction storing its hash and metadata.
- View a table of all documents from the contract.
- Filter by category or by owner address.
- Open the file via a public IPFS gateway link.

How to run
1. Start Hardhat node in the repo root: `npx hardhat node`
2. Deploy the contract (already has an ignition deployment script), or ensure the address in `src/App.tsx` matches your deployment.
3. In `frontend/`, run: `npm i` then `npm run dev`
4. Open the app, click "Connect Wallet" (switch to 31337 if prompted).
5. Choose a file, fill metadata, and Register. After success, see it in the list and click Open to view via IPFS.

Notes
- Files live on IPFS, not the blockchain. The chain stores only the hash and metadata.
- Use any gateway; default is `https://ipfs.io/ipfs/<hash>`.
- For production IPFS access, consider pinning and private gateways.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
