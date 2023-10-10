const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe.only('EvidenceChainOfCustody contract', function () {
   

    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('EvidenceChainOfCustody');
        let evidenceChainOfCustody = await EvidenceChainOfCustody.deploy();
        //await evidenceChainOfCustody.deployed();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, evidenceChainOfCustody }
    };

    it('should update stage details for an evidence item', async function () {

        const {evidenceChainOfCustody} = await loadFixture(deploy)
        const evidenceId = 1;
        const stageId = 0;
        const newDetails = '';

        // Add a new stage
        await evidenceChainOfCustody.addNewStage(stageId, 'Identification');

        //add Evidence Item
        await evidenceChainOfCustody.addEvidenceItem(1,'database Logs')

        // Update stage details
        await evidenceChainOfCustody.updateStageDetails(evidenceId, stageId, newDetails);

        // Verify the updated stage details
        const updatedDetails = await evidenceChainOfCustody.evidenceStageDetails(evidenceId, stageId);
        //verify other details
        const evidenceIdnName = await evidenceChainOfCustody.evidenceItems(evidenceId)
        console.log(evidenceIdnName,updatedDetails)
        expect(updatedDetails).to.equal(newDetails);
    });

    it('should not update stage details for a non-existing evidence item', async function () {
      const  {evidenceChainOfCustody} = await loadFixture(deploy)
        const nonExistingEvidenceId = 2;
        const stageId = 0;
        const newDetails = 'Updated Stage Details';

        // Attempt to update stage details for a non-existing evidence item
        await expect(evidenceChainOfCustody.updateStageDetails(nonExistingEvidenceId, stageId, newDetails))
            .to.be.revertedWith("Evidence item with this ID does not exist");
    });

    it('should not update stage details for an unauthorized user', async function () {
        const { evidenceChainOfCustody, authorizedUser1 }=  await loadFixture(deploy)

        const evidenceId = 1;
        const stageId = 0;
        const newDetails = 'Updated Stage Details';

        // Attempt to update stage details with an unauthorized user
        await expect(evidenceChainOfCustody.connect(authorizedUser1).updateStageDetails(evidenceId, stageId, newDetails))
            .to.be.revertedWith("Not authorized");
    });

    it('should log evidence details for all stages', async function () {
        const { evidenceChainOfCustody, authorizedUser1 } = await loadFixture(deploy)

        // Add two new evidence item
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
            await evidenceChainOfCustody.addNewStage(i, stages[i]);
        }

        //add details
        await evidenceChainOfCustody.updateStageDetails(1, 0, "Identified to help tell the software that was used to remotely access  the PC")
        await evidenceChainOfCustody.updateStageDetails(1, 1, "The command `pstree` has been used to get the proccess tree and the process tree save in .text file. The file has then been transfter to flashdisk v003")
        await evidenceChainOfCustody.updateStageDetails(1, 2, "No futher acquisation is required has the evidence has been recieved as volatile evidence")
        await evidenceChainOfCustody.updateStageDetails(1, 3, "The file was moved  from the volitale data flash disk (V001)  to the evidence presatavion disk (P007)into a folder that was creted for this case with the name DE7698. The file was the encrypted with a password")
        await evidenceChainOfCustody.updateStageDetails(1, 4, "The Folder DE7698 was copied from the presavation disk (P007) to the analysis lab Disk (A037) thus moving the this evidence item along. The analysis report has been developed and saved in a folder name processTree together with the this evidence item")
        await evidenceChainOfCustody.updateStageDetails(1, 5, "The original file stored on P007 has be copied to the case presentation disk (C003), the Analysis reported has also been copied to the case presetation disk (C003) and both files save on a folder named ProccessTree ")
        
        //log out the evidenceItem Chain of custody
        const evidenceIdnName = await evidenceChainOfCustody.evidenceItems(1)
         let evidenceStageDetails = []
        for (let i = 0; i < stages.length; i++) {
            const currentStageName = await evidenceChainOfCustody.getStageName(i);
            //console.log(currentStageName)
            const currentStageDetails = await evidenceChainOfCustody.evidenceStageDetails(1, i);
            //console.log(currentStageDetails)
            const details = {
                currentStageName:currentStageName,
                currentStageDetails: currentStageDetails
            }

            console.log(details)
            evidenceStageDetails.push(details)

        }

        console.log(`evidenceID:${evidenceIdnName.id} evidenceName: ${evidenceIdnName.name}`)
        console.log(`${evidenceStageDetails}`)


        

    });
});



