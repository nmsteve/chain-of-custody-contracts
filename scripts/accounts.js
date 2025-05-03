const { ethers } = require("hardhat");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

async function addUser(contract, userAddress, userName, userRole, password) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);


  const tx = await contract.addUser(userAddress, userName, userRole, passwordHash);
  await tx.wait();

  console.log(`User added with address: ${userAddress}`);
}

async function updateAdmin(contract, newAdminAddress) {
  const tx = await contract.updateAdmin(newAdminAddress);
  await tx.wait();

  console.log(`Admin updated to: ${newAdminAddress}`);
}

async function main() {
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
  //const wallet = ethers.HDNodeWallet.fromPhrase(process.env.MNEMONIC).connect(provider);
  //const admin = wallet.deriveChild(0);
  //const walletAddress = wallet.address;
  //console.log("Wallet address:", walletAddress);
  // Get the deployed contract instance
  const Accounts = await ethers.getContractFactory("Accounts");
  const accounts_contract = Accounts.attach(process.env.ACCOUNTS_CONTRACT_ADDRESS);

  const userAddress = '0xaD291fd43f685f7658Cb241C2f8ED3e68AA851a2';
  const password = "admin123#";

  //await addUser(accounts_contract, userAddress, 'Laban', 'admin', password);

  const newAdminAddress = '0xad291fd43f685f7658cb241c2f8ed3e68aa851a2';
  await updateAdmin(accounts_contract, newAdminAddress);
}

module.exports = main;

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}