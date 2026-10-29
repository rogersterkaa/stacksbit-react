import { ethers } from 'ethers';
import { BOT_CHAIN, EVM_CONTRACT_ADDRESS } from './config';

// Simplified ABI with just the functions we need
const CONTRACT_ABI = [
  'function createPayment(string calldata description) external returns (uint256)',
  'function payInvoice(uint256 paymentId) external payable',
  'function confirmDelivery(uint256 paymentId) external',
  'function registerMerchant(string calldata businessName, string calldata email) external',
  'event PaymentCreated(uint256 indexed paymentId, address indexed merchant, uint256 amount, string description)',
  'error NotBuyer()',
  'error WrongStatus()',
  'error PaymentNotFound()',
  'error InsufficientAmount()',
  'error AlreadyRegistered()',
  'error NotRegistered()',
];

const errorInterface = new ethers.Interface(CONTRACT_ABI);

// Reads the name of a custom contract error (like AlreadyRegistered) from a failed call
export function decodeRevert(err: any): string | undefined {
  const data = err?.data ?? err?.info?.error?.data ?? err?.error?.data;
  if (typeof data === 'string' && data.startsWith('0x')) {
    try {
      return errorInterface.parseError(data)?.name;
    } catch {
      // not one of our errors
    }
  }
  return err?.revert?.name;
}

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
  await tx.wait();
  return tx.hash;
}

export async function createPayment(description: string) {
  const contract = await getEVMContract();
  const tx = await contract.createPayment(description);
  const receipt = await tx.wait();

  // Read the payment ID from the PaymentCreated event
  let paymentId: string | null = null;
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === 'PaymentCreated') {
        paymentId = parsed.args.paymentId.toString();
        break;
      }
    } catch {
      // not an event from this contract
    }
  }

  return { txHash: tx.hash, blockNumber: receipt?.blockNumber, paymentId };
}

export async function payInvoice(paymentId: number, amountBOT: string) {
  const contract = await getEVMContract();
  const amountWei = ethers.parseEther(amountBOT);

  // Test the payment first. If the contract would reject it, this throws
  // before MetaMask asks for approval, so no gas is spent.
  await contract.payInvoice.staticCall(paymentId, { value: amountWei });

  const tx = await contract.payInvoice(paymentId, { value: amountWei, gasLimit: 500000 });
  await tx.wait();
  return tx.hash;
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

  if (currentChainId === expectedChainId) {
    console.log('Already connected to ' + BOT_CHAIN.name);
    return;
  }

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
      `Wrong network. Expected ${BOT_CHAIN.name} (${BOT_CHAIN.chainId}), received ${verifiedChainId}.`
    );
  }

  console.log(BOT_CHAIN.name + ' verified');
}