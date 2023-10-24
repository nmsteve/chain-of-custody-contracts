const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { BigNumber } = require('ethers');

describe('AdminContract', function () {
    let adminContract;
    let admin;

    async function deploy() {
        const [owner, user1, user2, addr1, addr2, ...addrs] = await ethers.getSigners();

        const AdminContract = await ethers.getContractFactory('AdminContract');
        adminContract = await AdminContract.deploy();
        return { adminContract, admin: owner , addr1,user1, user2 };
    }

    beforeEach(async function () {
        ({ adminContract, admin, addr1, user1, user2  } = await loadFixture(deploy));
    });

    describe('Add user', function () {
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
    })

    describe('Get user', function () {
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
    })

    describe('Update user', function () {
       
        it('should update user address and password hash', async function () {
           

            // Add a user
            await adminContract.addUser(user1.address, 'oldPasswordHash');

            const userId = 1;
            const newUserAddress = user1.address;
            const newPasswordHash = 'newPasswordHash';

            // Update the user
            await adminContract.updateUser(userId, newUserAddress, newPasswordHash);

            // Get the user's updated details
            const [updatedUserAddress, updatedPasswordHash] = await adminContract.getUser(userId);

            expect(updatedUserAddress).to.equal(newUserAddress);
            expect(updatedPasswordHash).to.equal(newPasswordHash);
        });

        it('should not update a user by non-admin', async function () {
            const { adminContract, user1, user2 } = await loadFixture(deploy);

            await adminContract.addUser(user1.address, 'passwordHash1');
            await expect(adminContract.connect(user2).updateUser(1, user2.address, 'newPasswordHash')).to.be.revertedWith("Only admin can perform this action");
        });

        it('should not update user with invalid user ID', async function () {
          

            const invalidUserId = 0; // Invalid user ID
            const newUserAddress = user1.address;
            const newPasswordHash = 'newPasswordHash';

            // Attempt to update an invalid user
            await expect(adminContract.updateUser(invalidUserId, newUserAddress, newPasswordHash)).to.be.revertedWith('User does not exist');
        });

        it('should not update user with invalid user address', async function () {
           

            // Add a user
            await adminContract.addUser(user1.address, 'oldPasswordHash');

            const userId = 1;
            const invalidUserAddress = ethers.ZeroAddress; // Invalid user address
            const newPasswordHash = 'newPasswordHash';

            // Attempt to update with an invalid user address
            await expect(adminContract.updateUser(userId, invalidUserAddress, newPasswordHash)).to.be.revertedWith('Invalid user address');
        });

        it('should not update user with empty password hash', async function () {
        

            // Add a user
            await adminContract.addUser(user1.address, 'oldPasswordHash');

            const userId = 1;
            const newUserAddress = user1.address;
            const emptyPasswordHash = '';

            // Attempt to update with an empty password hash
            await expect(adminContract.updateUser(userId, newUserAddress, emptyPasswordHash)).to.be.revertedWith('Password hash cannot be empty');
        });

    });

    describe('Remove user', function () {
        it('should remove a user', async function () {
            const { adminContract, admin } = await loadFixture(deploy);

            // Add a new user
            const newUserAddress = ethers.getAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
            const newPasswordHash = '0x5efcc5e4d707d5a2253246c37aebadd38bfda096';
            await adminContract.addUser(newUserAddress, newPasswordHash);

            // Get the user ID
            const userId = 1;

            // Ensure the user was added
            const [userAddress, passwordHash] = await adminContract.getUser(userId);
            expect(userAddress).to.equal(newUserAddress);
            expect(passwordHash).to.equal(newPasswordHash);

            // Remove the user
            await adminContract.removeUser(userId);

            // Check that the user is removed
            const [removedUserAddress, removedPasswordHash] = await adminContract.getUser(userId);
            expect(removedUserAddress).to.equal(ethers.ZeroAddress); // Address should be zero
            expect(removedPasswordHash).to.equal(''); // Password hash should be empty
        });
        it('should not remove a user by non-admin', async function () {
            const address = ethers.Wallet.createRandom().address
            const hash = 'xxxvht905n;bmjl;kfyv'

            //add user
            await adminContract.addUser(address, hash)

            //confirm user is added
            const [addedAddress, addHash] = await adminContract.getUser(1)
            expect(addedAddress).to.be.equals(address)
            expect(addHash).to.be.eqls(hash)

            //try to remove by a non-admin
           await expect(adminContract.connect(user1).removeUser(1)).to.be.revertedWith("Only admin can perform this action")
        })
        it('should revert when trying to remove a non-existent user', async function () {
            const { adminContract, admin } = await loadFixture(deploy);

            // Attempt to remove a non-existent user with ID 1
            const userId = 1;
            await expect(adminContract.removeUser(userId)).to.be.revertedWith('User does not exist');
        });
    })

});
