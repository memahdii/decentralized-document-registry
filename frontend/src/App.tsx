import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { createWalletClient, custom, publicActions } from 'viem';
import { hardhat } from 'viem/chains';
import contractAbi from './DocumentRegistry.json';
import './App.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- CONFIRM YOUR DEPLOYED CONTRACT ADDRESS HERE ---
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [authors, setAuthors] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [documents, setDocuments] = useState<Array<{
    id: bigint;
    docHash: string;
    owner: `0x${string}`;
    category: string;
    deadline: bigint;
    uploadTimestamp: bigint;
  }>>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<string>('');
  
  // --- PASTE YOUR PINATA JWT KEY HERE ---
  const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2ZjIxYWU0NS1jODQ3LTQzMWEtOWJlNi1mYmFmOGRjMzYwY2MiLCJlbWFpbCI6Im0uaG9zc2Vpbmlhbjc3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0OWZlYmQwZGFjYjgzNjYyNmM0OCIsInNjb3BlZEtleVNlY3JldCI6ImI0ODBmOWFjNjMwYjY3ODUzNjkwY2MxMTY5MWNlNjUwYjdhNDk3MWZmZGJhZTRmN2M0NmU1M2FiMDQ0YmJiYjMiLCJleHAiOjE3ODg3ODEzMjR9.q7vjisTc27A2yNwYX1UtrJR_SmFn_Jh94NwWUpfT2tw';

  const connectWallet = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const hardhatChainId = '0x7a69'; // 31337 in hexadecimal

      if (chainId !== hardhatChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hardhatChainId }],
          });
        } catch (switchError: any) {
          // If the Hardhat network is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: hardhatChainId,
                  chainName: 'Hardhat',
                  nativeCurrency: {
                    name: 'Hardhat ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                },
              ],
            });
          } else {
            console.error('Failed to switch network:', switchError);
            return;
          }
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !account) return alert("Please connect wallet and select a file.");

    setIsLoading(true);
    setMessage('1/3: Uploading file to IPFS...');

    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata for better IPFS pinning
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        category: category,
        authors: authors,
        uploadedBy: account
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    try {
      // Step 1: Upload to IPFS
      const ipfsResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { 
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      const ipfsHash = ipfsResponse.data.IpfsHash;
      console.log('IPFS Response:', ipfsResponse.data);
      console.log('IPFS Hash:', ipfsHash);
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      setMessage(`2/3: File uploaded! Hash: ${ipfsHash}. Please confirm the transaction in MetaMask...`);

      // Step 2: Call the Smart Contract
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      }).extend(publicActions);

      const deadlineTimestamp = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;
      
      const txHash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi.abi,
        functionName: 'uploadDocument',
        args: [ipfsHash, category, authors, deadlineTimestamp],
        account: account as `0x${string}`,
      });
      
      setMessage('3/3: Transaction sent! Waiting for confirmation...');
      await walletClient.waitForTransactionReceipt({ hash: txHash });

      setMessage(`Success! Document registered on the blockchain. Tx: ${txHash}`);
      await fetchDocuments();

    } catch (error) {
      console.error(error);
      setMessage('An error occurred. See the browser console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (!window.ethereum) return;
      const client = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      }).extend(publicActions);

      const items: Array<{
        id: bigint;
        docHash: string;
        owner: `0x${string}`;
        category: string;
        authors?: string;
        deadline: bigint;
        uploadTimestamp: bigint;
      }> = [];

      // If on-chain filters are provided, use them to reduce reads
      let ids: bigint[] | null = null;
      if (filterOwner && filterOwner.startsWith('0x') && filterOwner.length >= 6) {
        try {
          ids = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: contractAbi.abi,
            functionName: 'getDocumentsByOwner',
            args: [filterOwner as `0x${string}`],
          }) as unknown as bigint[];
        } catch {}
      } else if (filterCategory) {
        try {
          ids = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: contractAbi.abi,
            functionName: 'getDocumentsByCategory',
            args: [filterCategory],
          }) as unknown as bigint[];
        } catch {}
      }

      if (!ids) {
        const total = await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractAbi.abi,
          functionName: 'getTotalDocuments',
          args: [],
        }) as bigint;
        console.log('Total documents:', Number(total));
        for (let i = 1n; i <= total; i++) {
          try {
            const d = await client.readContract({
              address: contractAddress as `0x${string}`,
              abi: contractAbi.abi,
              functionName: 'documents',
              args: [i],
            }) as unknown as any;
            console.log('Document', i, ':', d);
            // Contract returns data as array: [id, docHash, owner, category, authors, deadline, uploadTimestamp]
            const doc = {
              id: d[0],
              docHash: d[1],
              owner: d[2],
              category: d[3],
              authors: d[4] || '',
              deadline: d[5],
              uploadTimestamp: d[6],
            };
            console.log('Parsed document:', doc);
            console.log('IPFS Hash from contract:', doc.docHash);
            items.push(doc);
          } catch (e) {
            console.error('Error reading document', i, ':', e);
          }
        }
      } else {
        for (const id of ids) {
          try {
            const d = await client.readContract({
              address: contractAddress as `0x${string}`,
              abi: contractAbi.abi,
              functionName: 'documents',
              args: [id],
            }) as unknown as any;
            console.log('Document by ID', id, ':', d);
            const doc = {
              id: d[0],
              docHash: d[1],
              owner: d[2],
              category: d[3],
              authors: d[4] || '',
              deadline: d[5],
              uploadTimestamp: d[6],
            };
            items.push(doc);
          } catch (e) {
            console.error('Error reading document by ID', id, ':', e);
          }
        }
      }
      setDocuments(items.reverse());
    } catch (e) {
      console.error('Failed to fetch documents', e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [account]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container nav">
          <div className="brand">
            <div className="brand-logo" />
            <div>
              <div className="brand-title">Document Registry</div>
              <div className="subtitle">Store hashes on-chain, files on IPFS</div>
            </div>
          </div>
          <div className="row">
            {account ? (
              <div className="account">
                <span className="pill">Connected</span>
                <span className="addr">{account}</span>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="container">
          <div className="hero">
            <h1 className="title">Register your documents securely</h1>
            <p>Upload to IPFS, then anchor the hash on your local Hardhat network.</p>
          </div>

          <div className="surface panel">
            {account ? (
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="label">Category</label>
                  <input className="input" type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
                <div className="grid-2">
                  <div className="form-row">
                    <label className="label">Deadline (optional)</label>
                    <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label className="label">Document</label>
                    <input className="file-input" type="file" onChange={(e) => e.target.files && setFile(e.target.files[0])} required />
                  </div>
                </div>
                <div className="form-row">
                  <label className="label">Authors</label>
                  <input className="input" type="text" placeholder="e.g., Alice, Bob" value={authors} onChange={(e) => setAuthors(e.target.value)} />
                </div>
                <div className="actions">
                  <button className="btn" type="button" onClick={() => { setCategory(''); setDeadline(''); setAuthors(''); setFile(null); setMessage(''); }}>Clear</button>
                  <button className="btn btn-primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing…' : 'Register Document'}
                  </button>
                </div>
                {message && <div className="message">{message}</div>}
              </form>
            ) : (
              <div className="surface panel" style={{ textAlign: 'center' }}>
                <div className="stack">
                  <div className="subtitle">You are not connected</div>
                  <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
                </div>
              </div>
            )}
          </div>

          <div className="surface panel" style={{ marginTop: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="title" style={{ fontSize: 18 }}>Documents</div>
              <div className="row">
                <input className="input" placeholder="Filter by category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: 200 }} />
                <input className="input" placeholder="Filter by owner (0x...)" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} style={{ width: 260 }} />
              </div>
            </div>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Authors</th>
                    <th>Deadline</th>
                    <th>Uploaded</th>
                    <th>IPFS</th>
                  </tr>
                </thead>
                <tbody>
                  {documents
                    .filter(d => !filterCategory || (d.category && d.category.toLowerCase().includes(filterCategory.toLowerCase())))
                    .filter(d => !filterOwner || (d.owner && d.owner.toLowerCase().includes(filterOwner.toLowerCase())))
                    .map((d) => {
                      const deadlineDate = Number(d.deadline) > 0 ? new Date(Number(d.deadline) * 1000) : null;
                      const uploadedDate = new Date(Number(d.uploadTimestamp) * 1000);
                      const shortOwner = d.owner ? `${d.owner.slice(0, 6)}…${d.owner.slice(-4)}` : '-';
                      const ipfsHash = d.docHash;
                      const gateways = [
                        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                        `https://dweb.link/ipfs/${ipfsHash}`,
                        `https://app.pinata.cloud/ipfs/files` // Direct link to Pinata dashboard
                      ];
                      const copyHash = () => {
                        navigator.clipboard.writeText(ipfsHash);
                        alert('IPFS hash copied to clipboard!');
                      };
                      return (
                        <tr key={String(d.id)}>
                          <td>{String(d.id)}</td>
                          <td>{d.category || '-'}</td>
                          <td title={d.owner || ''}>{shortOwner}</td>
                          <td>{(d as any).authors || '-'}</td>
                          <td>{deadlineDate ? deadlineDate.toLocaleDateString() : '-'}</td>
                          <td>{uploadedDate.toLocaleString()}</td>
                          <td>
                            <div className="ipfs-actions">
                              <a className="ipfs-btn primary" href={gateways[1]} target="_blank" rel="noreferrer">
                                <span>🌐</span> Open File
                              </a>
                              <a className="ipfs-btn secondary" href={gateways[2]} target="_blank" rel="noreferrer">
                                <span>📁</span> Dashboard
                              </a>
                              <button className="ipfs-btn copy" onClick={copyHash}>
                                <span>📋</span> Copy
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="subtitle" style={{ textAlign: 'center', padding: 16 }}>No documents yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <span className="muted">Powered by Hardhat, viem, and IPFS (Pinata).</span>
        </div>
      </footer>
    </div>
  );
}

export default App;