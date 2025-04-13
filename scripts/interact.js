// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  

  // Simulating stage names
  const stages = [
    'Identification',
    'Collection',
    'Acquisition',
    'Preservation',
    'Analysis',
    'Presentation',
    'Archiving',
  ];

  const [owner] = await hre.ethers.getSigners()
  console.log('Owner address:', owner.address);
  this.contract = await hre.ethers.getContractFactory('CaseFactory');
  this.contract = this.contract.attach('0xa0b375b2AA0472982541f97acE3302fbA05e45ae')
  await this.contract.connect(owner).setAdmin('0xad291fd43f685f7658cb241c2f8ed3e68aa851a2')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
