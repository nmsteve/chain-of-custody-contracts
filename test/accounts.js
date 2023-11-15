const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe.only('Contract', function () {
    let accountsContract;
    let admin;

    async function deploy() {
        const [owner, user1, user2, user3, user4, addr1, addr2, ...addrs] = await ethers.getSigners();

        const AdminContract = await ethers.getContractFactory('Accounts');
        accountsContract = await AdminContract.deploy();
        return { accountsContract, admin: owner, addr1, user1, user2, user3, user4 };
    }

    beforeEach(async function () {
        ({ accountsContract, admin, addr1, user1, user2, user3, user4 } = await loadFixture(deploy));
    });

    describe('Add user', function () {
        it('should allow the admin to add a user', async function () {
            const userAddress = ethers.Wallet.createRandom().address;
            const passwordHash = 'password123';

            await accountsContract.addUser(userAddress, passwordHash);

            const [fetchedUserAddress, fetchedPasswordHash] = await accountsContract.getUser(0);

            expect(fetchedUserAddress).to.equal(userAddress);
            expect(fetchedPasswordHash).to.equal(passwordHash);
        });

        it('should not allow a non-admin to add a user', async function () {
            const userAddress = ethers.Wallet.createRandom().address;
            const passwordHash = 'password123';

            await expect(
                accountsContract.connect(addr1).addUser(userAddress, passwordHash)
            ).to.be.revertedWith('Only admin can perform this action');
        });

        it('should not allow an admin to add a user with an empty address', async function () {
            const passwordHash = 'password123';

            await expect(accountsContract.addUser(ethers.ZeroAddress, passwordHash)).to.be.revertedWith(
                'Invalid user address'
            );
        });
        it('should not allow an admin to add a user with an empty password hash', async function () {
            const userAddress = ethers.Wallet.createRandom().address;

            await expect(accountsContract.addUser(userAddress, '')).to.be.revertedWith('Password hash cannot be empty');
        });
    })

    describe('Get a user', function () {
        it('should return user data based on user ID', async function () {
            const userAddress = ethers.Wallet.createRandom().address;
            const passwordHash = 'password123';

            await accountsContract.addUser(userAddress, passwordHash);

            const [fetchedUserAddress, fetchedPasswordHash, fetchedActiveState] = await accountsContract.getUser(0);

            expect(fetchedUserAddress).to.equal(userAddress);
            expect(fetchedPasswordHash).to.equal(passwordHash);
            expect(fetchedActiveState).to.equal(true)
        });

        it('should not return data for a non-existent user', async function () {
            await expect(accountsContract.getUser(2)).to.be.revertedWith('User does not exist');
        });


    })

    describe('Update user', function () {

        it('should update user  password hash', async function () {

            // Add a user
            await accountsContract.addUser(user1.address, 'oldPasswordHash');

            const userId = 0;
            const newPasswordHash = 'newPasswordHash';

            // Update the user
            await accountsContract.updateUser(userId, newPasswordHash);

            // Get the user's updated details
            const [userAddress, updatedPasswordHash, state] = await accountsContract.getUser(userId);


            expect(updatedPasswordHash).to.equal(newPasswordHash);
        });

        it('should not update a user by non-admin', async function () {
            const { accountsContract, user1, user2 } = await loadFixture(deploy);

            await accountsContract.addUser(user1.address, 'passwordHash1');
            await expect(accountsContract.connect(user2).updateUser(0, 'newPasswordHash')).to.be.revertedWith("Only admin can perform this action");
        });

        it('should not update user with invalid user ID', async function () {


            const invalidUserId = 0; // Invalid user ID
            const newUserAddress = user1.address;
            const newPasswordHash = 'newPasswordHash';

            // Attempt to update an invalid user
            await expect(accountsContract.updateUser(invalidUserId, newPasswordHash)).to.be.revertedWith('User does not exist');
        });

        it('should not update user with empty password hash', async function () {


            // Add a user
            await accountsContract.addUser(user1.address, 'oldPasswordHash');

            const userId = 0;
            const emptyPasswordHash = '';

            // Attempt to update with an empty password hash
            await expect(accountsContract.updateUser(userId, emptyPasswordHash)).to.be.revertedWith('Password hash cannot be empty');
        });

        it('should revert when called by a non-admin', async () => {
            const nonAdminAddress = user1.address// the address of a non-admin user
            const userId = 0; // Replace with the desired user ID
            const newPasswordHash = 'newPassword123'; // Replace with the desired new password hash

            // Connect a non-admin wallet to the contract
            const nonAdminAccountsContract = accountsContract.connect(user1);

            // Expect the updateUser function to revert when called by a non-admin
            await expect(nonAdminAccountsContract.updateUser(userId, newPasswordHash)).to.be.revertedWith('Only admin can perform this action');
        });

    });

    describe('get all users', function () {

        it("should return empty arrays when no users are added", async () => {
            const userAddresses = await accountsContract.getAllUsers();
            expect(userAddresses).to.be.an("array").that.is.empty;
        });

        it("should return user IDs and addresses after adding users", async () => {
            // Add a few users
            await accountsContract.addUser(user1.address, "password1");
            await accountsContract.addUser(user2.address, "password2");
            await accountsContract.addUser(user3.address, "password2");
            await accountsContract.addUser(user4.address, "password2");

            const userAddresses = await accountsContract.getAllUsers();
            console.log(userAddresses)

            // Check if the arrays contain the correct user IDs and addresses
            expect(userAddresses).to.deep.equal([user1.address, user2.address, user3.address, user4.address]);
        });

    })
    
    describe('record LogIn', function () {
        it('should record a login by admin', async function () {

            // user Id
            const userId = 0; 

            // Add a user
            await accountsContract.addUser(user1.address, 'PasswordHash');

            // Set up the admin signer
            const adminSigner = accountsContract.connect(admin);

            // Call the recordLogin function as admin
            const tx = await adminSigner.recordLogin(userId);

            // Wait for the transaction to be mined
            await tx.wait();

            // Check if the UserLogin event was emitted
            const events = await accountsContract.queryFilter('UserLogin', tx.blockNumber);
            expect(events.length).to.equal(1);

            // Check if the emitted event has the correct values
            const loginEvent = events[0];
            expect(loginEvent.args.userId).to.equal(userId);
        });

        it('should not allow non-admin to record a login', async function () {
            const userId = 1; // user ID
            const nonAdmin = accountsContract.connect(user1);

            // Try to call recordLogin as non-admin
            await expect(nonAdmin.recordLogin(userId)).to.be.revertedWith('Only admin can perform this action');
        });

        it('should revert if user does not exist', async function () {

            const nonExistentUserId = 999; // Replace with a non-existent user ID
            // Add a user
            await accountsContract.addUser(user1.address, 'PasswordHash');
            // Set up the admin signer
            const adminSigner = accountsContract.connect(admin);
            // Try to call recordLogin with a non-existent user ID
            await expect(adminSigner.recordLogin(nonExistentUserId)).to.be.revertedWith('User does not exist');
        });

    })

    describe('setUserState', () => {

        it('should set a user state to active', async () => {
            await accountsContract.addUser(user1.address, 'PasswordHash');
            const userId = 0; // The desired user ID
            const newState = true;

            // Call the setUserState function
            await accountsContract.setUserState(userId, newState);

            // Fetch the user to check the updated state
            const [userAddress, passwordHash, isActive] = await accountsContract.getUser(userId);

            // Assert that the user state is updated
            expect(isActive).to.equal(newState);
        });

        it('should set a user state to inactive', async () => {
            await accountsContract.addUser(user1.address, 'PasswordHash');

            const userId = 0; // Replace with another user ID
            const newState = false;

            // Call the setUserState function
            await accountsContract.setUserState(userId, newState);

            // Fetch the user to check the updated state
            const [userAddress, passwordHash, isActive] = await accountsContract.getUser(userId);

            // Assert that the user state is updated
            expect(isActive).to.equal(newState);
        });

        it('should revert if the user does not exist', async () => {

            const nonExistentUserId = 100; // An ID that does not exist

            // Expect the setUserState function to revert
            await expect(accountsContract.setUserState(nonExistentUserId, true)).to.be.revertedWith('User does not exist');
        });

        it('should revert when called by a non-admin', async () => {

            await accountsContract.addUser(user1.address, 'PasswordHash');

            const userId = 0; // Replace with the desired user ID
            const newState = true;

            // Connect a non-admin wallet to the contract

            const nonAdminAccountsContract = accountsContract.connect(user1);

            // Expect the setUserState function to revert when called by a non-admin
            await expect(nonAdminAccountsContract.setUserState(userId, newState)).to.be.revertedWith('Only admin can perform this action');
        });

    });


});
