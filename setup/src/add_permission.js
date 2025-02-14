import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiClient } from "@mysten/sui/client";
import dotenv from "dotenv";
import { toB64 } from "@mysten/sui/utils"; // Import toB64 utility

dotenv.config();
const MNEMONIC = "actual cigar sunny trumpet elevator horror actual sing violin verb come way";

async function getWalletKeypair() {
  try {
    const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
    return keypair;
  } catch (error) {
    console.error("Error deriving keypair:", error);
    throw error;
  }
}

async function getSigner() {
  const keypair = await getWalletKeypair();
  return keypair;
}

async function getWalletAddress() {
  const keypair = await getWalletKeypair();
  const address = keypair.toSuiAddress();
  console.log("Wallet Address:", address);
  return address;
}

async function getWalletBalance() {
  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
    const address = await getWalletAddress();
    const balance = await client.getBalance({ owner: address });

    console.log("Wallet Balance:", balance.totalBalance, "SUI");
    return balance;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

const suiClient = new SuiClient({
  url: "https://fullnode.testnet.sui.io",
});

async function create_permission_object() {
  try {
    const tx = new Transaction();
    const signer = await getSigner();
    const sender = signer.toSuiAddress(); // Corrected to get address from signer

    const packageID = process.env.PACKAGE_ID?.toString() || "";
    const objectID = process.env.PERMISSIONOJECTID?.toString() || "";

    tx.moveCall({
      target: `${packageID}::shareobject::add_permission`,
      arguments: [
          tx.object(objectID),
          tx.pure.vector("string", ["permission2", "permission2"]),
      ]
    });

    tx.setSender(sender);
    tx.setGasBudget(500000000);

    const transactionBytes = await tx.build({ client: suiClient });
    const signature = await signer.signTransaction(transactionBytes);

    const result = await suiClient.executeTransactionBlock({
      transactionBlock: toB64(transactionBytes),
      signature: signature.signature,
      options: {
        showEffects: true,
      },
    });

    if (result.effects?.status?.error) {
      throw new Error(`Error during mint_and_transfer: ${result.effects?.status?.error}`);
    }

    console.log("Transaction executed successfully:", result);
  } catch (error) {
    console.error("Error creating permission object:", error);
  }
}

getWalletBalance();
create_permission_object();
