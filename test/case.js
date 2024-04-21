const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


describe('Case contract', function () {

    async function deploy() {
        const [owner, authorizedUser1, authorizedUser2, addr1, addr2, ...addrs] = await ethers.getSigners();
        // Simulating stage names
        const stages = [
            'Identification',
            'Collection',
            'Acquisition',
            'Preservation',
            'Analysis',
            'Presentation',
            'Archiving',
        ];
        // Deploy the contract
        let EvidenceChainOfCustody = await ethers.getContractFactory('Case');
        let casex = await EvidenceChainOfCustody.deploy(owner.address, authorizedUser1.address, stages);
        //await casex.deployed();
        return { owner, authorizedUser1, authorizedUser2, addr1, addr2, casex }
    };

    it("should allow admin to update the admin address", async function () {
        const { casex, owner, authorizedUser1 } = await loadFixture(deploy);

        const newAdmin = authorizedUser1.address;

        // Ensure the admin address is different before the update
        const oldAdmin = await casex.admin();
        expect(oldAdmin).to.not.equal(newAdmin);

        // Call the setAdmin function
        await casex.setAdmin(newAdmin);

        // Verify that the admin address has been updated
        const updatedAdmin = await casex.admin();
        expect(updatedAdmin).to.equal(newAdmin);
    });

    describe('Stage Oparations', function () {
        it('should retrieve all stage names', async () => {
            const { casex } = await loadFixture(deploy)
            // Call the getStageNames function
            const stageNames = await casex.getStageNames();
            //console.log(stageNames)

            // Perform assertions
            expect(stageNames).to.be.an('array'); // Check if it returns an array
            expect(stageNames.length).to.be.equal(7)
        });

    });

    describe('EvidenceItem Items name and ID', function () {
        it('should add an evidence item', async function () {

            const { casex } = await loadFixture(deploy)
            let item1 = { id: 1000, name: 'database Logs' }
            let item2 = { id: 1001, name: "Proccess tree" }


            //add Evidence Item
            await casex.addEvidenceItem(item1.id, item1.name)
            await casex.addEvidenceItem(item2.id, item2.name)


            //verify other details
            const evidenceItem1 = await casex.evidenceItems(item1.id)
            const evidenceItem2 = await casex.evidenceItems(item2.id)
            expect(evidenceItem1.id).to.be.eq(item1.id)
            expect(evidenceItem1.name).to.equal(item1.name);
            expect(evidenceItem2.id).to.be.eq(item2.id)
            expect(evidenceItem2.name).to.equal(item2.name);
        });

        it('should revert when adding an evidence item with an existing ID', async function () {
            const { casex } = await loadFixture(deploy);
            const existingItemId = 1000;
            const itemName = 'Existing Item';

            // Add an evidence item with the existing ID
            await casex.addEvidenceItem(existingItemId, itemName);

            // Attempt to add another evidence item with the same ID (expect revert)
            await expect(casex.addEvidenceItem(existingItemId, 'Another Item')).to.be.revertedWith('Evidence item with this ID exists');
        });

        it('should update an evidence item', async function () {
            const { casex } = await loadFixture(deploy);
            let item = { id: 2000, name: 'Original Item' };
            let updatedName = 'Updated Item';

            // Add the original evidence item
            await casex.addEvidenceItem(item.id, item.name);

            // Test updating an existing evidence item
            await casex.updateEvidenceItem(item.id, updatedName);

            // Verify that the evidence item is updated
            const updatedItem = await casex.evidenceItems(item.id);
            expect(updatedItem.id).to.be.eq(item.id);
            expect(updatedItem.name).to.equal(updatedName);
        });

        it('should revert when updating a non-existent evidence item', async function () {
            const { casex } = await loadFixture(deploy);
            const nonExistentItemId = 999;
            const updatedName = 'Updated Item';

            // Test updating an evidence item that does not exist (expect revert)
            await expect(casex.updateEvidenceItem(nonExistentItemId, updatedName)).to.be.revertedWith('Evidence item with this ID does not exist');
        });



    })

    describe('Evidence Item Stage details', function () {



        it('Should add Stage Details to an evidence item', async function () {

            const { casex } = await loadFixture(deploy)

            const evidenceItem = {
                id: 1000,
                name: 'Database Logs',
                stageDetails: {
                    1: 'Identified by Peter M',
                    2: 'Collected by Peter with the help of David'
                }
            };


            // Add the evidence item
            await casex.addEvidenceItem(evidenceItem.id, evidenceItem.name);

            // Update stage details
            await casex.addStageDetails(evidenceItem.id, 0, evidenceItem.stageDetails[1]);
            await casex.addStageDetails(evidenceItem.id, 1, evidenceItem.stageDetails[2]);

            // Get evidence details
            const storedEvidenceItem = await casex.evidenceItems(evidenceItem.id);

            expect(storedEvidenceItem.id).to.equal(evidenceItem.id);
            expect(storedEvidenceItem.name).to.equal(evidenceItem.name);
            expect(storedEvidenceItem.stageCount).to.equal(2);

            // Get evidence stage details
            const stage1Details = await casex.getStageDetails(evidenceItem.id, 0);
            const stage2Details = await casex.getStageDetails(evidenceItem.id, 1);

            expect(stage1Details.stageName).to.equal('Identification');
            expect(stage1Details.stageDetails).to.equal(evidenceItem.stageDetails[1]);
            expect(stage2Details.stageName).to.equal('Collection');
            expect(stage2Details.stageDetails).to.equal(evidenceItem.stageDetails[2]);
        });

        it('should add stage details only once', async function () {

            const { casex, authorizedUser1 } = await loadFixture(deploy);
            // Add an evidence item
            await casex.addEvidenceItem(1, 'Sample Item');

            // Add stage details for the first time
            await casex.addStageDetails(1, 0, 'First details');

            // Try adding stage details again for the same stage, should revert
            await expect(casex.addStageDetails(1, 0, 'Second details')).to.be.revertedWith(
                'Stage detail already exists'
            );

            // Ensure that the stage details are correct
            const stageDetails = await casex.getStageDetails(1, 0);
            expect(stageDetails.stageDetails).to.equal('First details');
        });

        it('Should update Stage Details for an evidence item', async function () {

            const { casex } = await loadFixture(deploy)
            const evidenceItem = {
                id: 1000,
                name: 'Database Logs',
                stageDetails: {
                    1: 'Identified by Peter M',
                    2: 'Collected by Peter with the help of David'
                }
            };

            // Add the evidence item
            await casex.addEvidenceItem(evidenceItem.id, evidenceItem.name);

            // Update stage details
            await casex.addStageDetails(evidenceItem.id, 0, evidenceItem.stageDetails[1]);
            await casex.addStageDetails(evidenceItem.id, 1, evidenceItem.stageDetails[2]);

            // Get evidence details
            const storedEvidenceItem = await casex.evidenceItems(evidenceItem.id);

            expect(storedEvidenceItem.id).to.equal(evidenceItem.id);
            expect(storedEvidenceItem.name).to.equal(evidenceItem.name);
            expect(storedEvidenceItem.stageCount).to.equal(2);

            // Update stage details
            const updatedDetails = 'Updated details for the first stage';
            await casex.updateStageDetails(evidenceItem.id, 0, updatedDetails);

            // Get updated evidence stage details
            const updatedStageDetails = await casex.getStageDetails(evidenceItem.id, 0);
            expect(updatedStageDetails.stageName).to.equal('Identification');
            expect(updatedStageDetails.stageDetails).to.equal(updatedDetails);
        });

        it('should not update stage details for a non-existing evidence item', async function () {
            const { casex } = await loadFixture(deploy)
            const nonExistingEvidenceId = 2;
            const stageId = 0;
            const newDetails = 'Updated Stage Details';

            // Attempt to update stage details for a non-existing evidence item
            await expect(casex.addStageDetails(nonExistingEvidenceId, stageId, newDetails))
                .to.be.revertedWith("Evidence item with this ID does not exist");
        });

        it('should not update stage details form an unauthorized user', async function () {
            const { casex, authorizedUser1, authorizedUser2 } = await loadFixture(deploy)

            const evidenceId = 1;
            const stageId = 0;
            const newDetails = 'Updated Stage Details';

            // Attempt to update stage details with an unauthorized user
            await expect(casex.connect(authorizedUser2).addStageDetails(evidenceId, stageId, newDetails))
                .to.be.revertedWith("Not authorized");
        });

    });

    describe('Evidence Item Stage details get oporations', function () {


        it("should get evidence items within a range", async () => {
            const { casex } = await loadFixture(deploy);

            const itemDetails = [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" },
                { id: 4, name: "Item 4" },
                { id: 5, name: "Item 5" }
            ];

            for (const item of itemDetails) {
                await casex.addEvidenceItem(item.id, item.name);
            }

            const startIndex = 1; // Start index of the range
            const endIndex = 3; // End index of the range (you can adjust this value)

            const [ids, names, addTimes, stageCounts] = await casex.getEvidenceItemsInRange(startIndex, endIndex);

            const expectedIds = [2, 3, 4]; // Example IDs within the specified range
            const expectedNames = ["Item 2", "Item 3", "Item 4"]; // Example names within the specified range

            expect(ids.length).to.be.equal(endIndex - startIndex);

            for (let i = 0; i < endIndex - startIndex; i++) {
                expect(ids[i]).to.be.equal(expectedIds[i]);
                expect(names[i]).to.be.equal(expectedNames[i]);
                expect(addTimes[i] * BigInt(1000)).to.be.lessThanOrEqual(Date.now());
                expect(stageCounts[i]).to.be.equal(0);
            }
        });

        it("should revert when getting evidence items with invalid range", async () => {
            const { casex } = await loadFixture(deploy);

            const itemDetails = [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" },
                { id: 4, name: "Item 4" },
                { id: 5, name: "Item 5" }
            ];

            for (const item of itemDetails) {
                await casex.addEvidenceItem(item.id, item.name);
            }

            const invalidStartIndex = 10;
            const invalidEndIndex = 1; // This should be less than the start index

            await expect(casex.getEvidenceItemsInRange(invalidStartIndex, invalidEndIndex)).to.be.revertedWith(
                "Start index out of bounds"
            );
        });

        it("should get evidence items with endIndex greater than evidenceItemsLength", async () => {
            const { casex } = await loadFixture(deploy);

            const itemDetails = [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" },
                { id: 4, name: "Item 4" },
                { id: 5, name: "Item 5" }
            ];

            for (const item of itemDetails) {
                await casex.addEvidenceItem(item.id, item.name);
            }

            const _startIndex = 0;
            const _endIndex = 10; // Assuming a value greater than evidenceItemsLength

            const [ids, names, addTimes, stageCounts] = await casex.getEvidenceItemsInRange(_startIndex, _endIndex);

            // Validate the fetched data
            expect(ids.length).to.equal(itemDetails.length); // Ensure all items are fetched

            for (let i = 0; i < itemDetails.length; i++) {
                expect(ids[i]).to.equal(itemDetails[i].id);
                expect(names[i]).to.equal(itemDetails[i].name);
                expect(addTimes[i] * BigInt(1000)).to.be.lessThanOrEqual(Date.now());
                expect(stageCounts[i]).to.equal(0);
            }

        });

        it('Should get all details for a specific Evidence Item', async () => {

            const { casex } = await loadFixture(deploy)

            // Add an evidence item
            await casex.addEvidenceItem(1, 'Sample Item');

            // Update the stage details
            await casex.addStageDetails(1, 0, 'Details for Stage One');

            const result = await casex.getAllEvidenceItemDetails(1);
            console.log(result);

            //Perform assertions as needed
            expect(result.id).to.equal(1); // Adjust this based on the expected ID
            expect(result.name).to.equal('Sample Item'); // Adjust this based on the expected name
            expect(result.addTime).to.not.equal(0); // Adjust this based on the expected timestamp
            expect(result.allStages.length).to.equal(1); // Ensure the correct number of stages is returned
            expect(result.allStages[0].stageName).to.equal('Identification'); // Check the stage name
            expect(result.allStages[0].stageDetails).to.equal('Details for Stage One'); // Check the stage details
        });

        it('should get all stage details of specific stage ', async function () {
            const { casex, authorizedUser1 } = await loadFixture(deploy);

            // Add one new evidence item
            await casex.addEvidenceItem(1000, 'Proccess tree');

            // Define an array to hold stage details
            const stageDetails = [
                "Identified to help tell the software that was used to remotely access the PC",
                "The command `pstree` has been used to get the proccess tree and the process tree saved in .txt file. The file has then been transferred to flashdisk v003",
                "No further acquisition is required as the evidence has been received as volatile evidence",
                "The file was moved from the volitale data flash disk (V001) to the evidence presentation disk (P007) into a folder that was created for this case with the name DE7698. The file was then encrypted with a password",
                "The Folder DE7698 was copied from the presavation disk (P007) to the analysis lab Disk (A037), thus moving the evidence item along. The analysis report has been developed and saved in a folder named processTree together with this evidence item",
                "The original file stored on P007 has been copied to the case presentation disk (C003), the Analysis report has also been copied to the case presentation disk (C003) and both files saved in a folder named ProcessTree"
            ];

            // Add details from the 'stageDetails' array
            for (let i = 0; i < stageDetails.length; i++) {
                await casex.addStageDetails(1000, i, stageDetails[i]);
            }

            const result = await casex.getAllEvidenceItemDetails(1000);

            expect(result.id).to.be.equal(1000)
            expect(result.name).to.be.equal('Proccess tree')
            expect(result.stageCount).to.be.equal(6)

        });

        it("should get a stage update time", async () => {
            const { casex } = await loadFixture(deploy)

            // Add an evidence item
            await casex.addEvidenceItem(1, "Sample Item");

            // Add stage details
            const stageIndex = 0;
            const stageDetails = "Sample details";
            await casex.addStageDetails(1, stageIndex, stageDetails);

            // Get the update time
            const updateTime = await casex.getStageUpdateTime(1, stageIndex);

            // Check if the update time is greater than zero
            expect(updateTime).to.be.gt(0);
        });


    });

    describe(`Authorize Oparations`, function () {

        it('should allow the admin to enable and disable addresses', async function () {
            const { casex, owner, addr1, addr2 } = await loadFixture(deploy);

            // Admin enables addr1
            await casex.enableAddress(addr1.address);

            // Verify that addr1 is authorized
            expect(await casex.authorizedAddresses(addr1.address)).to.be.true;

            // Admin disables addr1
            await casex.disableAddress(addr1.address);

            // Verify that addr1 is no longer authorized
            expect(await casex.authorizedAddresses(addr1.address)).to.be.false;

            // Admin enables addr2
            await casex.enableAddress(addr2.address);

            // Verify that addr2 is authorized
            expect(await casex.authorizedAddresses(addr2.address)).to.be.true;

            // Admin disables addr2
            await casex.disableAddress(addr2.address);

            // Verify that addr2 is no longer authorized
            expect(await casex.authorizedAddresses(addr2.address)).to.be.false;
        });

        it('should not allow non-admin users to enable or disable addresses', async function () {
            const { casex, owner, addr1, addr2 } = await loadFixture(deploy);

            // Attempt to enable an address as a non-admin user
            await expect(casex.connect(addr1).enableAddress(addr2.address)).to.be.revertedWith('Only admin can perform this action');

            // Attempt to disable an address as a non-admin user
            await expect(casex.connect(addr1).disableAddress(addr2.address)).to.be.revertedWith('Only admin can perform this action');
        });
    });

});



