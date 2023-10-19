const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { BigNumber } = require('ethers');

describe.only('AdminContract', function () {
    let adminContract;
    let admin;

    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        const AdminContract = await ethers.getContractFactory('AdminContract');
        adminContract = await AdminContract.deploy();
        return { adminContract, admin: owner , addr1};
    }

    beforeEach(async function () {
        ({ adminContract, admin, addr1  } = await loadFixture(deploy));
    });

    it('should allow the admin to add a user', async function () {
        const userAddress = ethers.Wallet.createRandom().address;
        const passwordHash = 'password123';

        await adminContract.addUser(userAddress, passwordHash);

        const [fetchedUserAddress, fetchedPasswordHash] = await adminContract.getUser(1);

        expect(fetchedUserAddress).to.equal(userAddress);
        expect(fetchedPasswordHash).to.equal(passwordHash);
    });

    it('should not allow a non-admin to add a user', async function () {
        const userAddress = ethers.Wallet.createRandom().address;
        const passwordHash = 'password123';

        await expect(
            adminContract.connect(addr1).addUser(userAddress, passwordHash)
        ).to.be.revertedWith('Only admin can perform this action');
    });

    it('should return user data based on user ID', async function () {
        const userAddress = ethers.Wallet.createRandom().address;
        const passwordHash = 'password123';

        await adminContract.addUser(userAddress, passwordHash);

        const [fetchedUserAddress, fetchedPasswordHash] = await adminContract.getUser(1);

        expect(fetchedUserAddress).to.equal(userAddress);
        expect(fetchedPasswordHash).to.equal(passwordHash);
    });

    it('should not return data for a non-existent user', async function () {
        await expect(adminContract.getUser(2)).to.be.revertedWith('User does not exist');
    });

    it('should not allow an admin to add a user with an empty address', async function () {
        const passwordHash = 'password123';

        await expect(adminContract.addUser(ethers.ZeroAddress, passwordHash)).to.be.revertedWith(
            'Invalid user address'
        );
    });

    it('should not allow an admin to add a user with an empty password hash', async function () {
        const userAddress = ethers.Wallet.createRandom().address;

        await expect(adminContract.addUser(userAddress, '')).to.be.revertedWith('Password hash cannot be empty');
    });
});
