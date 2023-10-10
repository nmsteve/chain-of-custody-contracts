const { expect } = require('chai');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('EvidenceChainOfCustody contract', function () {

    const evidenceItemId = 1;
    const evidenceItemName = 'Test Evidence Item';

    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('EvidenceChainOfCustody');
        let evidenceChainOfCustody = await EvidenceChainOfCustody.deploy();
        //await evidenceChainOfCustody.deployed();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, evidenceChainOfCustody }
    };

    // Helper function to add a new stage
    async function addNewStage(stageName, contract) {
        await contract.addNewStage(stageName);
        const addedStageName = await contract.getStageName(contract.stageNames.length - 1); // Get the name of the last added stage
        expect(addedStageName).to.equal(stageName);
    }

    it('should add a new stage', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy);
        const stageName = 'Collection';
        // Add a new stage
        await evidenceChainOfCustody.addNewStage(stageName);
        const addedStageName = await evidenceChainOfCustody.getStageName(0); // Get the name of the  added stage
        expect(addedStageName).to.equal(stageName);

    });

    it('should add multiple new stages', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy);
        const stages = [
            'Identification',
            'Collection',
            'Acquisition',
            'Preservation'
        ];

        for (const stage of stages) {
            await evidenceChainOfCustody.addNewStage(stage);
        }

        expect(await evidenceChainOfCustody.stageNames(0)).to.be.equal('Identification')
        expect(await evidenceChainOfCustody.stageNames(1)).to.be.equal('Collection')
        expect(await evidenceChainOfCustody.stageNames(2)).to.be.equal('Acquisition')
        expect(await evidenceChainOfCustody.stageNames(3)).to.be.equal('Preservation')
        
    });

   
    it('should add a new evidence item', async () => {
        const { evidenceChainOfCustody } = await loadFixture(deploy);
        await evidenceChainOfCustody.addEvidenceItem(evidenceItemId, evidenceItemName);
        const evidenceItem = await evidenceChainOfCustody.evidenceItems(evidenceItemId);
        expect(evidenceItem.id).to.equal(evidenceItemId);
        expect(evidenceItem.name).to.equal(evidenceItemName);
        console.log(evidenceItem)
    });

    it('should not add a new evidence item if unauthorized', async () => {
        const { evidenceChainOfCustody, addr1 } = await loadFixture(deploy);
        await expect(evidenceChainOfCustody.connect(addr1).addEvidenceItem(evidenceItemId, evidenceItemName)).to.be.revertedWith("Not authorized");
    });

    it('should add an evidence item and update stage details', async function () {
        const { evidenceChainOfCustody } = await loadFixture(deploy);
        const evidenceId = 1;
        const evidenceName = 'Evidence Item 1';
        const details = 'Stage 1 Details';

        // Add a new evidence item
        await evidenceChainOfCustody.addEvidenceItem(evidenceId, evidenceName);

        // Add a new stage
        await evidenceChainOfCustody.addNewStage('Stage 1');

        // Update stage details
        await evidenceChainOfCustody.updateStageDetails(evidenceId, 0, details); // Assuming the first stage (index 0) is 'Stage 1'

        // Check if the evidence item was added correctly
        const evidenceItem = await evidenceChainOfCustody.evidenceItems(evidenceId);
        expect(evidenceItem.id).to.equal(evidenceId);
        expect(evidenceItem.name).to.equal(evidenceName);

        console.log(evidenceItem)

        // Check if the stage details were updated correctly
        expect(await evidenceChainOfCustody.evidenceItems(evidenceId).stageDetails(0)).to.equal(details);
    });
});
