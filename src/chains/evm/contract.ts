import { ethers } from 'ethers';
import { BOT_CHAIN, EVM_CONTRACT_ADDRESS } from './config';

// Simplified ABI with just the functions we need
const CONTRACT_ABI = [
  'function createPayment(string calldata description) external returns (uint256)',
  'function payInvoice(uint256 paymentId) external payable',
  'function confirmDelivery(uint256 paymentId) external',
  'function registerMerchant(string calldata businessName, string calldata email) external',
];

export async function getEVMProvider() {
  if (!(window as any).ethereum) {
    throw new Error('MetaMask not detected');
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

export async function getEVMSigner() {
  const provider = await getEVMProvider();
  return provider.getSigner();
}

export async function getEVMContract() {
  const signer = await getEVMSigner();
  return new ethers.Contract(EVM_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function registerMerchant(businessName: string, email: string) {
  const contract = await getEVMContract();
  const tx = await contract.registerMerchant(businessName, email);
  const receipt = await tx.wait();
  return receipt?.transactionHash;
}

export async function createPayment(description: string) {
  const contract = await getEVMContract();
  const tx = await contract.createPayment(description);
  const receipt = await tx.wait();
  
  // Extract payment ID from events if needed
  return {
    txHash: receipt?.transactionHash,
    blockNumber: receipt?.blockNumber,
  };
}

export async function payInvoice(paymentId: number, amountBOT: string) {
  const contract = await getEVMContract();
  const amountWei = ethers.parseEther(amountBOT);
  const tx = await contract.payInvoice(paymentId, { value: amountWei, gasLimit: 500000 });
  const receipt = await tx.wait();
  return receipt?.transactionHash;
}

export async function confirmDelivery(paymentId: number) {
  const contract = await getEVMContract();
  const tx = await contract.confirmDelivery(paymentId);
  await tx.wait();
return tx.hash;
}

export async function ensureBOTChainNetwork() {
  if (!(window as any).ethereum) {
    throw new Error('MetaMask not detected');
  }

  const ethereum = (window as any).ethereum;

  // Normalize chain IDs because MetaMask may return lowercase hex.
  const expectedChainId = BOT_CHAIN.chainIdHex.toLowerCase();

  // Check current network
  const currentChainId = String(
    await ethereum.request({
      method: 'eth_chainId',
    })
  ).toLowerCase();

  console.log('BOT Chain network check:', {
    currentChainId,
    expectedChainId,
    numericChainId: BOT_CHAIN.chainId,
  });

  // Already on BOT Chain Mainnet
  if (currentChainId === expectedChainId) {
    console.log('✅ Already connected to BOT Chain Mainnet');
    return;
  }

  // Switch to BOT Chain Mainnet
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: BOT_CHAIN.chainIdHex,
        },
      ],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: BOT_CHAIN.chainIdHex,
            chainName: BOT_CHAIN.name,
            rpcUrls: [BOT_CHAIN.rpcUrl],
            nativeCurrency: BOT_CHAIN.nativeCurrency,
            blockExplorerUrls: [BOT_CHAIN.blockExplorer],
          },
        ],
      });
    } else {
      throw error;
    }
  }

  // Verify network after switching
  const verifiedChainId = String(
    await ethereum.request({
      method: 'eth_chainId',
    })
  ).toLowerCase();

  console.log('BOT Chain verification:', {
    verifiedChainId,
    expectedChainId,
  });

  if (verifiedChainId !== expectedChainId) {
    throw new Error(
      `Wrong network. Expected BOT Chain Mainnet (${BOT_CHAIN.chainId}), received ${verifiedChainId}.`
    );
  }

  console.log('✅ BOT Chain Mainnet verified');
}