
# Digital Chain of Custody System Contracts

This repository contains the smart contracts for the Digital Chain of Custody system. There are three contracts in this repository:

1. **CaseFactory**: Deploys cases.
2. **Case (EvidenceChain of Custody)**: The case contract that tracks the chain of custody for all evidence items.
3. **Admin**: Manages password hashes and other administrative activities.

## Setup

To install the dependencies, clone the repository and install the required packages:

1. Clone the repository using Git:
   ```sh
   gh repo clone https://github.com/nmsteve/chain-of-custody-contracts.git
   ```
   or using the GitHub CLI (if you have it installed):
   ```sh
   gh repo clone nmsteve/chain-of-custody-contracts
   ```

2. Install dependencies using Yarn:
   ```sh
   yarn install
   ```

You need to set environment variables to run other commands. Rename the sample `.env-example` file to `.env` and configure the following environment variables:

- **SEPOLIA**: This is the node you will use to access the blockchain network. You can use services like [Alchemy](https://alchemyapi.io/) to create a free node, or explore other providers like [QuickNode](https://www.quicknode.com/).

- **MNEMONIC**: To obtain a mnemonic, use a wallet such as [MetaMask](https://metamask.io/). This is a 12-24 word phrase known as a seed. A seed is used to generate a public and private key pair for accessing the blockchain.

- **ETHERSCAN_API_KEY**: This is used for verifying smart contracts.

## Commands

- To run the tests:
  ```sh
  npx hardhat test
  ```

- To check the test coverage:
  ```sh
  npx hardhat coverage
  ```

- To deploy the smart contracts:
  ```sh
  npx hardhat run <script-path> --network <network-name>
  ```

- To verify the deployed contracts:
  ```sh
  npx hardhat verify <address> --network <network-name>
  ```

Replace `<script-path>`, `<network-name>`, and `<address>` with the appropriate values as needed.

