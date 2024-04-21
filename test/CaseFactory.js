const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { N } = require('ethers');

describe.only('CaseFactory contract', function () {
    let owner, authorizedUser1, authorizedUser2, authorizedUser3, addr1, addr2, caseFactory;

    async function deploy() {
        [owner, authorizedUser1, authorizedUser2, authorizedUser3, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the CaseFactory contract
        const CaseFactory = await ethers.getContractFactory('CaseFactory');
        caseFactory = await CaseFactory.deploy();
        return { owner, authorizedUser1, authorizedUser2, authorizedUser3, addr1, addr2, caseFactory };
    }

    it('should deploy CaseFactory and set admin', async function () {
        const { caseFactory, owner } = await loadFixture(deploy);

        expect(await caseFactory.admin()).to.equal(owner.address);
    });

    it('should add and remove authorized users', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        expect(await caseFactory.authorizedUsers(authorizedUser1.address)).to.equal(true);

        await caseFactory.removeAuthorizedUser(authorizedUser1.address);
        expect(await caseFactory.authorizedUsers(authorizedUser1.address)).to.equal(false);
    });

    it('Should set the stages for use when deploying a case', async () => {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        await caseFactory.setCaseStages(stages);

        // Get the set stages
        const retrievedStages = await caseFactory.getCaseStages();

        // Compare set stages with the retrieved stages
        expect(retrievedStages).to.eql(stages);
    });

    it('should deploy a new casex successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;


        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        const caseData = await caseFactory.cases(caseID);
        expect(caseData.caseID).to.equal(caseID);
        expect(caseData.active).to.equal(true);
        expect(caseData.caseContractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it('should not deploy a casex with an existing casex ID', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Attempt to deploy a casex with the same ID
        await expect(caseFactory.deployCase(caseID, owner.address, authorizedUser1.address)).to.be.revertedWith('Case with this ID already exists');
    });

    it('should not deploy a casex as an unauthorized user', async function () {
        const { caseFactory, owner, addr1 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;

        // Attempt to deploy a casex without being an authorized user
        await expect(caseFactory.connect(addr1).deployCase(caseID, owner.address, authorizedUser1.address)).to.be.revertedWith('Not authorized to deploy the chain of custody');
    });

    it('should enable a casex successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Attempt to enable the casex
        await caseFactory.disableCase(caseID);
        await caseFactory.enableCase(caseID);

        const caseData = await caseFactory.cases(caseID);
        expect(caseData.active).to.equal(true);
    });

    it('should not enable an already enabled casex', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);


        // Attempt to enable the casex again
        await expect(caseFactory.enableCase(caseID)).to.be.revertedWith('Case is already enabled');
    });

    it('should disable a casex successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Sta ge 2', 'Stage 3'];
        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);


        // Disable the casex
        await caseFactory.disableCase(caseID);

        const caseData = await caseFactory.cases(caseID);
        expect(caseData.active).to.equal(false);
    });

    it('should not disable an already disabled casex', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Disable the casex
        await caseFactory.disableCase(caseID);

        // Attempt to disable the casex again
        await expect(caseFactory.disableCase(caseID)).to.be.revertedWith('Case is already disabled');
    });

    it('should not enable a casex as an unauthorized user', async function () {
        const { caseFactory, addr1 } = await loadFixture(deploy);

        const caseID = 1;

        // Attempt to enable a casex without being an authorized user
        await expect(caseFactory.connect(addr1).enableCase(caseID)).to.be.revertedWith("Only admin can perform this action");
    });

    it('should not disable a casex as an unauthorized user', async function () {

        const { caseFactory, addr2 } = await loadFixture(deploy);

        const caseID = 1;

        // Attempt to disable a casex without being an authorized user
        await expect(caseFactory.connect(addr2).disableCase(caseID)).to.be.revertedWith("Only admin can perform this action");
    });

    it.only('should record case access successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Deploy a case
        const caseID = 1;
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Record access
        await caseFactory.access(caseID);

        // Retrieve the access record for the owner
        const accessTimestamp = await caseFactory.getAccessRecord(caseID, owner.address);

        // console.log(`accessTimestamp: ${accessTimestamp}`)
        // console.log(`time.latest: ${await time.latest()}`)

        //Assert that the access timestamp is not zero
        expect(accessTimestamp).to.not.equal(0);
        expect(accessTimestamp).to.be.equal(await time.latest());
    });

    it.only('should get access record for a specific user', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Deploy a case
        const caseID = 1;
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Record access
        await caseFactory.connect(authorizedUser1).access(caseID);

        // Retrieve the access record for authorizedUser1
        const accessTimestamp = await caseFactory.getAccessRecord(caseID, authorizedUser1.address);

        // Assert that the access timestamp is not zero
        expect(accessTimestamp).to.not.equal(0);
        expect(accessTimestamp).to.be.equal(await time.latest());
    });

    it.only('should log all access records for three users', async function () {
        const { caseFactory, owner, authorizedUser1, authorizedUser2, authorizedUser3 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
        const caseID = 1;

        // Deploy a case and record access for authorized users
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.addAuthorizedUser(authorizedUser2.address);
        await caseFactory.addAuthorizedUser(authorizedUser3.address);
        await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

        // Record access for all authorized users
        await caseFactory.connect(authorizedUser1).access(caseID);
        await caseFactory.connect(authorizedUser2).access(caseID);
        await caseFactory.connect(authorizedUser3).access(caseID);

        // Get all access records for the case
        const [users, accessTimestamps] = await caseFactory.getAllAccessRecords(caseID);

        // Log all access records
        console.log('Access Records:');
        console.log('| User              | Access Timestamp    |');
        console.log('|-------------------|---------------------|');

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const timestamp = accessTimestamps[i];
            const date = new Date(Number(timestamp) * 1000).toUTCString();
            console.log(`| ${user} | ${date} |`);
        }
    });



});

it('should get casex status', async function () {
    const { caseFactory, owner } = await loadFixture(deploy);
    // Simulating stage names
    const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
    const caseID = 1;

    await caseFactory.addAuthorizedUser(authorizedUser1.address);
    await caseFactory.deployCase(caseID, owner.address, authorizedUser1.address);

    let caseStatus = await caseFactory.getCaseStatus(caseID);
    expect(caseStatus).to.equal(true);

    await caseFactory.disableCase(caseID);

    caseStatus = await caseFactory.getCaseStatus(caseID);
    expect(caseStatus).to.equal(false);
});

it('should get all deployed cases and print their data', async function () {
    const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

    // Deploy five cases
    const numCases = 5;
    const caseData = [];
    // Simulating stage names
    const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

    for (let i = 1; i <= numCases; i++) {
        const tx = await caseFactory.deployCase(i, owner.address, authorizedUser1.address);
        await tx.wait(1)
        const casex = await caseFactory.cases(i);
        caseData.push(casex);
    }

    // Print the data in a table format
    console.log('Cases Data:');
    console.log('| Case ID | Case Address                               | Deployment Date               | Active |');
    console.log('|---------|--------------------------------------------|-------------------------------|--------|');

    for (const casex of caseData) {
        const caseID = casex.caseID.toString();
        const caseAddress = casex.caseContractAddress;
        const deploymentDate = new Date(Number(casex.deploymentDate) * 1000).toUTCString();
        const isActive = casex.active ? 'Yes' : 'No';

        //console.log(`| ${caseID.padEnd(7)} | ${caseAddress.padEnd(26)} |  | |`);
        console.log(`| ${caseID.padEnd(7)} | ${caseAddress.padEnd(26)} | ${deploymentDate.padEnd(15)} | ${isActive.padEnd(6)} |`);
    }
});

it("should allow admin to update the admin address", async function () {
    const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

    const newAdmin = authorizedUser1.address;

    // Ensure the admin address is different before the update
    const oldAdmin = await caseFactory.admin();
    expect(oldAdmin).to.not.equal(newAdmin);

    // Call the setAdmin function
    await caseFactory.setAdmin(newAdmin);

    // Verify that the admin address has been updated
    const updatedAdmin = await caseFactory.admin();
    expect(updatedAdmin).to.equal(newAdmin);
});

it("should revert if a non-admin tries to update the admin address", async function () {
    const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

    // Ensure the revert when a non-admin tries to update the admin address
    await expect(caseFactory.connect(authorizedUser1).setAdmin(authorizedUser1.address)).to.be.revertedWith(
        "Only admin can perform this action"
    );
});

describe("getCasesInRange", function () {
    it("should get cases within a valid range", async () => {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(1001, owner.address, authorizedUser1.address);
        await caseFactory.deployCase(1002, owner.address, authorizedUser1.address);
        await caseFactory.deployCase(1003, owner.address, authorizedUser1.address);

        const startPoint = 0;
        const endPoint = 3;

        const [caseAddresses, caseIds, deploymentDates, caseStatuses] =
            await caseFactory.getCasesInRange(startPoint, endPoint);
        console.log(caseAddresses, caseIds)

        expect(caseAddresses).to.have.lengthOf(endPoint - startPoint);
        expect(caseIds).to.have.lengthOf(endPoint - startPoint);
        expect(deploymentDates).to.have.lengthOf(endPoint - startPoint);
        expect(caseStatuses).to.have.lengthOf(endPoint - startPoint);


    });

    it("should handle an invalid range", async () => {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Deploy some cases for testing
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(1, owner.address, authorizedUser1.address);

        const startPoint = 1;
        const endPoint = 0;

        // Ensure the function reverts for an invalid range
        await expect(
            caseFactory.getCasesInRange(startPoint, endPoint)
        ).to.be.revertedWith("Invalid range");
    });

    it("should handle endPoint exceeding caseIDs length", async () => {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Deploy some cases for testing
        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(1, owner.address, authorizedUser1.address);
        await caseFactory.deployCase(2, owner.address, authorizedUser1.address);

        const startPoint = 0;
        const endPoint = 5; // exceed the length of caseIDs

        // Call the function and ensure it doesn't revert
        const [caseAddresses, caseIds, deploymentDates, caseStatuses] =
            await caseFactory.getCasesInRange(startPoint, endPoint);

        // Add your expectations based on your contract's logic and expected results
        // For example, you can check if the IDs, addresses, and statuses match the deployed cases.
    });
});

