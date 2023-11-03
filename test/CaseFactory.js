const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('CaseFactory contract', function () {
    let owner, authorizedUser1, authorizedUser2, addr1, addr2, caseFactory;

    async function deploy() {
        [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the CaseFactory contract
        const CaseFactory = await ethers.getContractFactory('CaseFactory');
        caseFactory = await CaseFactory.deploy();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, caseFactory };
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

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, stages);

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
        await caseFactory.deployCase(caseID, owner.address, stages);

        // Attempt to deploy a casex with the same ID
        await expect(caseFactory.deployCase(caseID, owner.address, stages)).to.be.revertedWith('Case with this ID already exists');
    });

    it('should not deploy a casex as an unauthorized user', async function () {
        const { caseFactory, owner, addr1 } = await loadFixture(deploy);
        
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;

        // Attempt to deploy a casex without being an authorized user
        await expect(caseFactory.connect(addr1).deployCase(caseID, owner.address, stages)).to.be.revertedWith('Not authorized to deploy the chain of custody');
    });

    it('should enable a casex successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);

        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, stages );

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
        await caseFactory.deployCase(caseID, owner.address, stages);

        
        // Attempt to enable the casex again
        await expect(caseFactory.enableCase(caseID)).to.be.revertedWith('Case is already enabled');
    });

    it('should disable a casex successfully', async function () {
        const { caseFactory, owner, authorizedUser1 } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, stages);

        
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
        await caseFactory.deployCase(caseID, owner.address, stages);

        // Disable the casex
        await caseFactory.disableCase(caseID);

        // Attempt to disable the casex again
        await expect(caseFactory.disableCase(caseID)).to.be.revertedWith('Case is already disabled');
    });

    it('should not enable a casex as an unauthorized user', async function () {
        const { caseFactory,addr1 } = await loadFixture(deploy);

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

    it('should get casex status', async function () {
        const { caseFactory, owner } = await loadFixture(deploy);
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];
        const caseID = 1;

        await caseFactory.addAuthorizedUser(authorizedUser1.address);
        await caseFactory.deployCase(caseID, owner.address, stages);

        let caseStatus = await caseFactory.getCaseStatus(caseID);
        expect(caseStatus).to.equal(true);

        await caseFactory.disableCase(caseID);

        caseStatus = await caseFactory.getCaseStatus(caseID);
        expect(caseStatus).to.equal(false);
    });

    it('should get all deployed cases and print their data', async function () {
        const { caseFactory, owner } = await loadFixture(deploy);

        // Deploy five cases
        const numCases = 5;
        const caseData = [];
        // Simulating stage names
        const stages = ['Stage 1', 'Stage 2', 'Stage 3'];

        for (let i = 1; i <= numCases; i++) {
            const tx = await caseFactory.deployCase(i, owner.address, stages);
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

});
