const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('EvidenceChainOfCustody contract', function () {


    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('EvidenceChainOfCustody');
        let evidenceChainOfCustody = await EvidenceChainOfCustody.deploy();
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

        it('should allow getting the stage count for an existing evidence item', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Add a new evidence item
            await evidenceChainOfCustody.addEvidenceItem(1, 'Test Evidence Item');

            // Add a new stage for the evidence item
            await evidenceChainOfCustody.addNewStage('Sample Stage');

            await evidenceChainOfCustody.updateStageDetails(1, 1, "Test Details")
            
            const details = await evidenceChainOfCustody.evidenceStageDetails(1, 1)
            //console.log(details)

            // Get the stage count for the evidence item
            const stageCount = await evidenceChainOfCustody.getStageCount(1);

            // Verify the stage count
            expect(stageCount).to.equal(1);
        });

        it('should allow getting the stage count for an evidence item with multiple stages', async function () {
            const {evidenceChainOfCustody} = await loadFixture(deploy);

            // Add a new evidence item
            await evidenceChainOfCustody.addEvidenceItem(1, 'Test Evidence Item');

            // Add multiple stages for the evidence item
            await evidenceChainOfCustody.addNewStage('Stage 1');
            await evidenceChainOfCustody.addNewStage('Stage 2');
            await evidenceChainOfCustody.addNewStage('Stage 3');

            await evidenceChainOfCustody.updateStageDetails(1, 1, "Stage 1 Test Details")
            await evidenceChainOfCustody.updateStageDetails(1, 2, "Stage 2 Test Details")
            await evidenceChainOfCustody.updateStageDetails(1, 3, "Stage 3 Test Details")

            // Get the stage count for the evidence item
            const stageCount = await evidenceChainOfCustody.getStageCount(1);

            // Verify the stage count
            expect(stageCount).to.equal(3);
        });

        it('should not allow getting the stage count for a non-existing evidence item', async function () {
            const { evidenceChainOfCustody, owner } = await loadFixture(deploy);

            // Attempt to get the stage count for a non-existing evidence item
            await expect(evidenceChainOfCustody.getStageCount(1)).to.be.revertedWith('Evidence item with this ID does not exist');
        });

        
        
    });

    describe('Stage Details Oparations', function () {
        it('should update stage details for an evidence item', async function () {

            const { evidenceChainOfCustody } = await loadFixture(deploy)
            const evidenceId = 1;
            const stageId = 1;
            const newDetails = '';

            // Add a new stage
            await evidenceChainOfCustody.addNewStage('Identification');

            //add Evidence Item
            await evidenceChainOfCustody.addEvidenceItem(evidenceId, 'database Logs')

            // Update stage details
            await evidenceChainOfCustody.updateStageDetails(evidenceId, stageId, newDetails);

            // Verify the updated stage details
            const updatedDetails = await evidenceChainOfCustody.evidenceStageDetails(evidenceId, stageId);
            //verify other details
            const evidenceItem = await evidenceChainOfCustody.evidenceItems(evidenceId)
            expect(evidenceItem.id).to.be.eq(evidenceId)
            expect(updatedDetails).to.equal(newDetails);
        });

        it('should log evidence details for all stages', async function () {

            const { evidenceChainOfCustody, authorizedUser1 } = await loadFixture(deploy)
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

            //add details
            await evidenceChainOfCustody.updateStageDetails(1, 1, "Identified to help tell the software that was used to remotely access  the PC")
            await evidenceChainOfCustody.updateStageDetails(1, 2, "The command `pstree` has been used to get the proccess tree and the process tree save in .txt file. The file has then been transfter to flashdisk v003")
            await evidenceChainOfCustody.updateStageDetails(1, 3, "No futher acquisition is required has the evidence has been recieved as volatile evidence")
            await evidenceChainOfCustody.updateStageDetails(1, 4, "The file was moved  from the volitale data flash disk (V001)  to the evidence presatavion disk (P007)into a folder that was creted for this case with the name DE7698. The file was the encrypted with a password")
            await evidenceChainOfCustody.updateStageDetails(1, 5, "The Folder DE7698 was copied from the presavation disk (P007) to the analysis lab Disk (A037) thus moving the this evidence item along. The analysis report has been developed and saved in a folder name processTree together with this evidence item")
            await evidenceChainOfCustody.updateStageDetails(1, 6, "The original file stored on P007 has be copied to the case presentation disk (C003), the Analysis reported has also been copied to the case presetation disk (C003) and both files save on a folder named ProccessTree ")

            //log out the evidenceItem Chain of custody
            const evidenceIdnName = await evidenceChainOfCustody.evidenceItems(1)
            let evidenceStageDetails = []

            for (let i = 1; i < stages.length; i++) {
                const currentStageName = await evidenceChainOfCustody.getStageName(i);
                //console.log(currentStageName)
                const currentStageDetails = await evidenceChainOfCustody.evidenceStageDetails(1, i);
                //console.log(currentStageDetails)
                const details = {
                    currentStageName: currentStageName,
                    currentStageDetails: currentStageDetails
                }

                console.log(details)
                evidenceStageDetails.push(details)

            }

            console.log(`evidenceID:${evidenceIdnName.id} evidenceName: ${evidenceIdnName.name}`)
            //console.log(`${evidenceStageDetails[0]}`)

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

});



