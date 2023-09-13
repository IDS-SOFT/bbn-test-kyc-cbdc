import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import { ethers } from "ethers";
const hre = require("hardhat");
const CBDC_kycJSON = require("./../kyc_cbdc/artifacts/contracts/kyc_cbdc.sol/CBDC_KYC.json");

const contractAddress: string = process.env.CONTRACT_ADDRESS || "";
const contractABI: any[] = CBDC_kycJSON.abi;

async function main() {
  //const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_NODE_URL || "");
  const provider = new ethers.JsonRpcProvider(process.env.RPC_NODE_URL || ""); // Newly added
  const signer = await hre.ethers.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    // Call functions here
    const createAccountTx = await contract.createAccount();
    await createAccountTx.wait();

    console.log("Account Created", signer.getAddress());
    const accountBalance = await contract.accounts(signer.getAddress());
    console.log("Account Balance:", accountBalance.toString()); // Convert BigNumber to string

    const accountCount = await contract.getAccountCount();
    console.log("Account Count:", accountCount.toString()); // Convert BigNumber to string

    const accountAddresses = [];
    for (let i = 0; i < accountCount; i++) {
      const addressAtIndex = await contract.getAccountAtIndex(i);
      accountAddresses.push(addressAtIndex);
    }
    console.log("Account Addresses:", accountAddresses);
    console.log("Check your transaction on BBN Testnet:", `http://testnet.bharatblockchain.io/address/${contractAddress}`);
  

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
