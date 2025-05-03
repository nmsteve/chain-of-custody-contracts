const { ethers } = require("hardhat");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { HDNodeVoidWallet } = require("ethers");
const { HDNodeWallet } = require("ethers");
dotenv.config();

async function addUser(contract, userAddress, userName, userRole, password) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const tx = await contract.addUser(userAddress, passwordHash, userName, userRole);
  await tx.wait();

  console.log(`User added with address: ${userAddress}`);
}

async function updateAdmin(contract, newAdminAddress) {
  const tx = await contract.updateAdmin(newAdminAddress);
  await tx.wait();

  console.log(`Admin updated to: ${newAdminAddress}`);
}

async function updateUser(contract, userId, newAddress, newPassword, newUserName, newRole) {
  let passwordHash = null;
  if (newPassword) {
    const saltRounds = 10;
    passwordHash = await bcrypt.hash(newPassword, saltRounds);
  }



  const tx = await contract.updateUser(userId, newAddress, passwordHash || "", newUserName || "", newRole || "");
  await tx.wait();

  console.log(`User with ID ${userId} updated successfully.`);
}

async function main() {
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
  const Accounts = await ethers.getContractFactory("Accounts");
  const wallet = ethers.HDNodeWallet.fromPhrase(process.env.MNEMONIC).connect(provider);
  const admin = wallet.deriveChild(0);
  const accounts_contract = Accounts.attach(process.env.ACCOUNTS_CONTRACT_ADDRESS).connect(admin);

  const userAddress = '0xaD291fd43f685f7658Cb241C2f8ED3e68AA851a2';
  const password = "admin123#";
  const hash = await bcrypt.hash(password, 10);

  // Example: Add a user
  // await addUser(accounts_contract, userAddress, 'Laban', 'admin', hash);

  // Example: Update a user
  const userId = 0; // Replace with the actual user ID
  const newAddress = '0xaD291fd43f685f7658Cb241C2f8ED3e68AA851a2';
  const newPassword = "admin123#";
  const newUserName = "Laban";
  // Note: You can set newPassword, newUserName, and newRole to null if you don't want to update them
  const newRole = "admin";
  await updateUser(accounts_contract, userId, newAddress, newPassword, newUserName, newRole);

  // Example: Update admin
  // const newAdminAddress = '0xad291fd43f685f7658cb241c2f8ed3e68aa851a2';
  //await updateAdmin(accounts_contract, newAdminAddress);
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