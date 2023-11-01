const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


describe('EvidenceChainOfCustody contract', function () {


    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('EvidenceChainOfCustody');
        let evidenceChainOfCustody = await EvidenceChainOfCustody.deploy(owner.address);
        //await evidenceChainOfCustody.deployed();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, evidenceChainOfCustody }
    };

    describe('Stage Oparations', function () {

        it('should add a new stage and update its name', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Initial Stage');
            expect(await evidenceChainOfCustody.getStageName(1)).to.equal('Initial Stage');

            // Update the name of the added stage
            await evidenceChainOfCustody.updateStageName(1, 'Updated Stage');
            expect(await evidenceChainOfCustody.getStageName(1)).to.equal('Updated Stage');
        });

        it('should add multiple stages with incremental IDs', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Add multiple stages
            for (let i = 1; i <= 5; i++) {
                await evidenceChainOfCustody.addNewStage(`Stage ${i}`);
            }

            // Check if the stage names and IDs are correct
            for (let i = 1; i < 5; i++) {
                expect(await evidenceChainOfCustody.getStageName(i)).to.equal(`Stage ${i}`);
            }
        });

        it('should not update the name of a non-existing stage', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Attempt to update the name of a non-existing stage
            await expect(evidenceChainOfCustody.updateStageName(0, 'Updated Stage')).to.be.revertedWith('Stage does not exist');
        });

        it('should not allow non-admin users to add new stages', async function () {
            const { evidenceChainOfCustody, owner, addr1 } = await loadFixture(deploy);

            // Attempt to add a new stage as a non-admin user
            await expect(evidenceChainOfCustody.connect(addr1).addNewStage('New Stage')).to.be.revertedWith('Only admin can perform this action');

            // Verify that the stage was not added
            await expect(evidenceChainOfCustody.getStageName(1)).to.be.revertedWith('Stage does not exist');
        });

        it('should not allow non-admin users to update stage names', async function () {
            const { evidenceChainOfCustody, owner, addr1 } = await loadFixture(deploy);

            // Attempt to update the name of an existing stage as a non-admin user
            await evidenceChainOfCustody.addNewStage('Initial Stage');
            await expect(evidenceChainOfCustody.connect(addr1).updateStageName(1, 'Updated Stage')).to.be.revertedWith('Only admin can perform this action');

            // Verify that the stage name was not updated
            expect(await evidenceChainOfCustody.getStageName(1)).to.equal('Initial Stage');
        });

        it('should allow getting the name of an existing stage', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Sample Stage');

            // Get the stage name
            const stageName = await evidenceChainOfCustody.getStageName(1);

            // Verify the stage name
            expect(stageName).to.equal('Sample Stage');
        });

        it('should not allow getting the name of a non-existing stage', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Attempt to get the name of a non-existing stage
            await expect(evidenceChainOfCustody.getStageName(1)).to.be.revertedWith('Stage does not exist');

        });

    });

    describe('Evidence Item Oparations', function () {

        it('should add an evidence item', async function () {

            const { evidenceChainOfCustody } = await loadFixture(deploy)
            let item1 = { id: 1000, name: 'database Logs' }
            let item2 = { id: 1001, name: "Proccess tree" }

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Identification');

            //add Evidence Item
            await evidenceChainOfCustody.addEvidenceItem(item1.id, item1.name)
            await evidenceChainOfCustody.addEvidenceItem(item2.id, item2.name)


            //verify other details
            const evidenceItem1 = await evidenceChainOfCustody.evidenceItems(0)
            const evidenceItem2 = await evidenceChainOfCustody.evidenceItems(1)
            expect(evidenceItem1.id).to.be.eq(item1.id)
            expect(evidenceItem1.name).to.equal(item1.name);
            expect(evidenceItem2.id).to.be.eq(item2.id)
            expect(evidenceItem2.name).to.equal(item2.name);
        });

        it('Should add Stage Details to an evidence item', async function () {

            const { evidenceChainOfCustody } = await loadFixture(deploy)

            const evidenceItem = {
                id: 1000,
                name: 'Database Logs',
                stageDetails: {
                    1: 'Identified by Peter M',
                    2: 'Collected by Peter with the help of David'
                }
            };

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Identification');
            await evidenceChainOfCustody.addNewStage('Collection');

            // Add the evidence item
            await evidenceChainOfCustody.addEvidenceItem(evidenceItem.id, evidenceItem.name);

            // Update stage details
            await evidenceChainOfCustody.addStageDetails(0, 1, evidenceItem.stageDetails[1]);
            await evidenceChainOfCustody.addStageDetails(0, 2, evidenceItem.stageDetails[2]);

            // Get evidence details
            const storedEvidenceItem = await evidenceChainOfCustody.evidenceItems(0);

            expect(storedEvidenceItem.id).to.equal(evidenceItem.id);
            expect(storedEvidenceItem.name).to.equal(evidenceItem.name);
            expect(storedEvidenceItem.stageCount).to.equal(2);

            // Get evidence stage details
            const stage1Details = await evidenceChainOfCustody.getStageDetails(0, 1);
            const stage2Details = await evidenceChainOfCustody.getStageDetails(0, 2);

            expect(stage1Details.stageName).to.equal('Identification');
            expect(stage1Details.stageDetails).to.equal(evidenceItem.stageDetails[1]);
            expect(stage2Details.stageName).to.equal('Collection');
            expect(stage2Details.stageDetails).to.equal(evidenceItem.stageDetails[2]);
        });

        it('Should update Stage Details for an evidence item', async function () {

            const { evidenceChainOfCustody } = await loadFixture(deploy)
            const evidenceItem = {
                id: 1000,
                name: 'Database Logs',
                stageDetails: {
                    1: 'Identified by Peter M',
                    2: 'Collected by Peter with the help of David'
                }
            };

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Identification');
            await evidenceChainOfCustody.addNewStage('Collection');

            // Add the evidence item
            await evidenceChainOfCustody.addEvidenceItem(evidenceItem.id, evidenceItem.name);

            // Update stage details
            await evidenceChainOfCustody.addStageDetails(0, 1, evidenceItem.stageDetails[1]);
            await evidenceChainOfCustody.addStageDetails(0, 2, evidenceItem.stageDetails[2]);

            // Get evidence details
            const storedEvidenceItem = await evidenceChainOfCustody.evidenceItems(0);

            expect(storedEvidenceItem.id).to.equal(evidenceItem.id);
            expect(storedEvidenceItem.name).to.equal(evidenceItem.name);
            expect(storedEvidenceItem.stageCount).to.equal(2);

            // Update stage details
            const updatedDetails = 'Updated details for the first stage';
            await evidenceChainOfCustody.updateStageDetails(0, 1, updatedDetails);

            // Get updated evidence stage details
            const updatedStageDetails = await evidenceChainOfCustody.getStageDetails(0, 1);
            expect(updatedStageDetails.stageName).to.equal('Identification');
            expect(updatedStageDetails.stageDetails).to.equal(updatedDetails);
        });

        it('should not update stage details for a non-existing evidence item', async function () {
            const { evidenceChainOfCustody } = await loadFixture(deploy)
            const nonExistingEvidenceId = 2;
            const stageId = 0;
            const newDetails = 'Updated Stage Details';

            // Attempt to update stage details for a non-existing evidence item
            await expect(evidenceChainOfCustody.updateStageDetails(nonExistingEvidenceId, stageId, newDetails))
                .to.be.revertedWith("Evidence item with this ID does not exist");
        });

        it('should not update stage details form an unauthorized user', async function () {
            const { evidenceChainOfCustody, authorizedUser1 } = await loadFixture(deploy)

            const evidenceId = 1;
            const stageId = 0;
            const newDetails = 'Updated Stage Details';

            // Attempt to update stage details with an unauthorized user
            await expect(evidenceChainOfCustody.connect(authorizedUser1).updateStageDetails(evidenceId, stageId, newDetails))
                .to.be.revertedWith("Not authorized");
        });

    });

    describe(`Authorize Oparations`, function () {

        it('should allow the admin to enable and disable addresses', async function () {
            const { evidenceChainOfCustody, owner, addr1, addr2 } = await loadFixture(deploy);

            // Admin enables addr1
            await evidenceChainOfCustody.enableAddress(addr1.address);

            // Verify that addr1 is authorized
            expect(await evidenceChainOfCustody.authorizedAddresses(addr1.address)).to.be.true;

            // Admin disables addr1
            await evidenceChainOfCustody.disableAddress(addr1.address);

            // Verify that addr1 is no longer authorized
            expect(await evidenceChainOfCustody.authorizedAddresses(addr1.address)).to.be.false;

            // Admin enables addr2
            await evidenceChainOfCustody.enableAddress(addr2.address);

            // Verify that addr2 is authorized
            expect(await evidenceChainOfCustody.authorizedAddresses(addr2.address)).to.be.true;

            // Admin disables addr2
            await evidenceChainOfCustody.disableAddress(addr2.address);

            // Verify that addr2 is no longer authorized
            expect(await evidenceChainOfCustody.authorizedAddresses(addr2.address)).to.be.false;
        });

        it('should not allow non-admin users to enable or disable addresses', async function () {
            const { evidenceChainOfCustody, owner, addr1, addr2 } = await loadFixture(deploy);

            // Attempt to enable an address as a non-admin user
            await expect(evidenceChainOfCustody.connect(addr1).enableAddress(addr2.address)).to.be.revertedWith('Only admin can perform this action');

            // Attempt to disable an address as a non-admin user
            await expect(evidenceChainOfCustody.connect(addr1).disableAddress(addr2.address)).to.be.revertedWith('Only admin can perform this action');
        });
    });

    describe.skip(`Get data`, function () {

        it('should log evidence details for all stages', async function () {
            const { evidenceChainOfCustody, authorizedUser1 } = await loadFixture(deploy);

            // Add one new evidence item
            await evidenceChainOfCustody.addEvidenceItem(1, 'Proccess tree');

            const stages = [
                'Identification',
                'Collection',
                'Acquisition',
                'Preservation',
                'Analysis',
                'Presentation',
                'Archiving',
            ];

            // Add new stages
            for (let i = 0; i < stages.length; i++) {
                await evidenceChainOfCustody.addNewStage(stages[i]);
            }

            // Add details
            await evidenceChainOfCustody.updateStageDetails(1, 1, "Identified to help tell the software that was used to remotely access the PC");
            await evidenceChainOfCustody.updateStageDetails(1, 2, "The command `pstree` has been used to get the proccess tree and the process tree saved in .txt file. The file has then been transferred to flashdisk v003");
            await evidenceChainOfCustody.updateStageDetails(1, 3, "No further acquisition is required as the evidence has been received as volatile evidence");
            await evidenceChainOfCustody.updateStageDetails(1, 4, "The file was moved from the volitale data flash disk (V001) to the evidence presentation disk (P007) into a folder that was created for this case with the name DE7698. The file was then encrypted with a password");
            await evidenceChainOfCustody.updateStageDetails(1, 5, "The Folder DE7698 was copied from the presavation disk (P007) to the analysis lab Disk (A037), thus moving the evidence item along. The analysis report has been developed and saved in a folder named processTree together with this evidence item");
            await evidenceChainOfCustody.updateStageDetails(1, 6, "The original file stored on P007 has been copied to the case presentation disk (C003), the Analysis report has also been copied to the case presentation disk (C003) and both files saved in a folder named ProcessTree");

            // Log out the evidence item Chain of Custody
            const evidenceIdnName = await evidenceChainOfCustody.evidenceItems(1);
            const evidenceStageDetails = [];

            for (let i = 1; i < stages.length; i++) {
                const currentStageName = await evidenceChainOfCustody.getStageName(i);
                const currentStageDetails = await evidenceChainOfCustody.evidenceStageDetails(1, i);

                const details = {
                    Stage: currentStageName,
                    Details: currentStageDetails,
                };

                evidenceStageDetails.push(details);
            }

            console.log(`Evidence ID: ${evidenceIdnName.id} Evidence Name: ${evidenceIdnName.name}`);

            console.log(evidenceStageDetails)
        });



    });

});



