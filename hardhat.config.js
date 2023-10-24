require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const ethers = require('ethers');
task('printPrivateKeys', 'Print the top 10 private keys from the mnemonic')
  .setAction(async (args, hre) => {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
      console.error('Mnemonic not found in .env file.');
      return;
    }

    const wallets = [];
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);

    for (let i = 0; i < 10; i++) {
      const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
      const privateKey = wallet.privateKey;
      console.log(privateKey)
      const address = wallet.address;
      wallets.push({ privateKey, address });
    }

    console.log('Top 10 Private Keys:');
    wallets.forEach((privateKey, index) => {
      console.log(`KEY_${index + 1}=${privateKey}`);
    });
  });


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
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
