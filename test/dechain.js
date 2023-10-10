
const { expect } = require('chai');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe.only('EvidenceChainOfCustody contract', function () {

    const evidenceItemId = 1;
    const evidenceItemName = 'Test Evidence Item';
    const stageId = 0;
    const stageDetails = 'Sample Stage Details';


    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('EvidenceChainOfCustody');
        let evidenceChainOfCustody = await EvidenceChainOfCustody.deploy();
        //await evidenceChainOfCustody.deployed();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, evidenceChainOfCustody }
    };

    // Helper function to add a new stage
    async function addNewStage(stageId, stageName, contract) {
        await contract.addNewStage(stageId, stageName);
        const addedStageName = await contract.getStageName(stageId);
        console.log(addedStageName)
        expect(addedStageName).to.equal(stageName);
    }

    it('should add a new stage', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy)
        const stageId = 1;
        const stageName = 'Collection';

        // Add a new stage
        await addNewStage(stageId, stageName, evidenceChainOfCustody);
    });

    it('should add multiple new stages', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy)
        const stages = [
            { id: 0, name: 'Identification' },
            { id: 1, name: 'Collection' },
            { id: 2, name: 'Acquisition' },
            { id: 3, name: 'Preservation' },
        ];

        for (const stage of stages) {
            await addNewStage(stage.id, stage.name, evidenceChainOfCustody);
        }
    });

    it('should not add a stage with an existing ID', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy)
        const stageId = 1;
        const stageName = 'Collection';

        // Add a new stage
        await addNewStage(stageId, stageName, evidenceChainOfCustody);

        // Attempt to add a stage with the same ID
        await expect(addNewStage(stageId, 'Duplicate', evidenceChainOfCustody)).to.be.revertedWith('Stage already exists');
    });

    it('should add add a new evidence', async () => {
        const { evidenceChainOfCustody } = await loadFixture(deploy)
        await evidenceChainOfCustody.addEvidenceItem(evidenceItemId, evidenceItemName);
        const evidenceItem = await evidenceChainOfCustody.evidenceItems(evidenceItemId);
        expect(evidenceItem.id).to.equal(evidenceItemId);
        expect(evidenceItem.name).to.equal(evidenceItemName);
    });

    it('should not add add a new evidence item if Unauthorized', async () => {
        const { evidenceChainOfCustody, addr1 } = await loadFixture(deploy)
        await expect(evidenceChainOfCustody.connect(addr1).addEvidenceItem(evidenceItemId, evidenceItemName)).to.be.revertedWith("Not authorized");

    });

    it('should add an evidence item and update stage details', async function () {
       
        const { evidenceChainOfCustody, addr1 } = await loadFixture(deploy)
          const contract = evidenceChainOfCustody
        const evidenceId = 1;
        const evidenceName = 'Evidence Item 1';
        const stageId = 1;
        const details = 'Stage 1 Details';

        // Add a new evidence item
        await contract.addEvidenceItem(evidenceId, evidenceName);

        // Add a new stage
        await contract.addNewStage(stageId, 'Stage 1');

        // Update stage details
        await contract.updateStageDetails(evidenceId, stageId, details);

        // Check if the evidence item was added correctly
        const evidenceItem = await contract.evidenceItems(evidenceId);
        expect(evidenceItem.id).to.equal(evidenceId);
        expect(evidenceItem.name).to.equal(evidenceName);

        // Check if the stage details were updated correctly
        expect(await contract.evidenceItems(evidenceId).stageDetails(stageId)).to.equal(details);
    });






});
