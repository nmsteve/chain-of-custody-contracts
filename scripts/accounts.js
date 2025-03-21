const { ethers } = require("hardhat");
const bcrypt = require("bcrypt");

async function addUser(contract, userAddress, password) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const tx = await contract.addUser(userAddress, passwordHash);
  await tx.wait();

  console.log(`User added with address: ${userAddress}`);
}

async function main() {
  const accounts = await ethers.getSigners();
  
  // Get the deployed contract instance
  const Accounts = await ethers.getContractFactory("Accounts");
  const accounts_contract = Accounts.attach(process.env.ACCOUNTS_CONTRACT_ADDRESS);

  const userAddress = '0xaD291fd43f685f7658Cb241C2f8ED3e68AA851a2'
  const password = "admin123#";

  await addUser(accounts_contract, userAddress, password);
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