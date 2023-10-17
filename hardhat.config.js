require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    opt: {
      url: process.env.OPTIMISM,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: "",
      },

    },
    arb: {
      url: process.env.ARBITRUM,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: "",
      },

    },
    mainnet: {
      url: process.env.MAIN,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: "",
      },

    }
  },

  etherscan: {

    apiKey: process.env.ETHERSCAN_API_KEY,
    //apiKey: process.env.BSCSCAN_API_KEY
    //apiKey: process.env.ARBITRUM_API_KEY
  },
};
