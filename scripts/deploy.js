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
  this.contract = await hre.ethers.getContractFactory('Case');
  this.contract = await this.contract.deploy(owner.address, stages);
  await this.contract.waitForDeployment()

  console.log(
    `contract deployed to ${this.contract.target}`
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
