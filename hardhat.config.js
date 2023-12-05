require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const ethers = require('ethers');

task('printAddress', 'Print the top 10 private keys, addresses, and balances from the mnemonic')
  .setAction(async (args, hre) => {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
      console.error('Mnemonic not found in .env file.');
      return;
    }

    const mainWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);

    for (let i = 0; i < 10; i++) {
      const wallet = mainWallet.deriveChild(i);
      const privateKey = wallet.privateKey;
      const address = wallet.address;

      const balance = await hre.ethers.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      console.log(`Account: ${i}`)
      //console.log(`Private Key: ${privateKey}`);
      console.log(`Address: ${address}`);
      console.log(`Balance: ${balanceInEth}`);
      console.log('-------------------------');
    }
  });



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the number of runs based on your contract
      },
    },
  },
  
  networks: {
    hardhat: {
      forking: {
        url: process.env.SEPOLIA,
        // allowUnlimitedContractSize: true,
        // timeout: 90000,
        blockNumber: 4462147,
        // chainId: 1,
        // gas: 9000000000000000
      }
    },
   
    sepolia: {
      url: process.env.SEPOLIA,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: "",
      },
    },
  
  },

  etherscan: {

    apiKey: process.env.ETHERSCAN_API_KEY,
    //apiKey: process.env.BSCSCAN_API_KEY
    //apiKey: process.env.ARBITRUM_API_KEY
  },
};
