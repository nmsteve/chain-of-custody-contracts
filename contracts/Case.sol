// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Case
 * @dev Smart contract for managing the chain of custody of evidence items.
 */
contract Case {
    struct EvidenceItem {
        uint256 id;
        string name;
        uint addTime;
        mapping(uint => StageDetails) evidenceStageDetails;
        uint stageCount;
    }

    struct StageDetails {
        string stageName;
        string stageDetails;
        uint256 updateTime;
    }

    mapping(uint => EvidenceItem) public evidenceItems;
    uint public evidenceItemsLength;

    string[] public stageNames; // array to store stage names

    mapping(address => bool) public authorizedAddresses;
    uint256[] public itemIds;
    address public admin;

    event EvidenceStageDetailsUpdated(
        uint256 indexed itemId,
        uint8 stage,
        string newDetails
    );
    event AdminUpdated(address newAdmin);
    event NewStageAdded(uint8 stage, string stageName);
    event EvidenceItemAdded(uint256 id, string name, uint timeStamp);
    event AddressEnabled(address enabledAddress); // Event for enabling an address
    event AddressDisabled(address disabledAddress);
    event EvidenceItemUpdated(uint256 id, string name, uint timeStamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == admin || authorizedAddresses[msg.sender],
            "Not authorized"
        );
        _;
    }

    constructor(address _admin, address _deployer, string[] memory _stages) {
        admin = _admin;
        authorizedAddresses[_deployer] = true;
        stageNames = _stages;
    }

    /**
     * @dev Update the admin address.
     * @param _newAdmin The address of the new admin.
     */
    function setAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
        emit AdminUpdated(_newAdmin);
    }

    /**
     * @dev Add a new evidence item with the specified ID and name.
     * @param _id The ID of the evidence item.
     * @param _name The name of the evidence item.
     */
    function addEvidenceItem(
        uint256 _id,
        string memory _name
    ) public onlyAuthorized {
        require(
            evidenceItems[_id].id == 0,
            "Evidence item with this ID exists"
        );
        EvidenceItem storage e = evidenceItems[_id];
        e.id = _id;
        e.name = _name;
        e.addTime = block.timestamp;
        evidenceItemsLength++;
        itemIds.push(_id);

        emit EvidenceItemAdded(_id, _name, block.timestamp);
    }

    /**
     * @dev update an evidence item with the specified ID and name.
     * @param _id The ID of the evidence item.
     * @param _name The name of the evidence item.
     */
    function updateEvidenceItem(
        uint256 _id,
        string memory _name
    ) public onlyAuthorized {
        require(
            evidenceItems[_id].id != 0,
            "Evidence item with this ID does not exist"
        );

        EvidenceItem storage e = evidenceItems[_id];
        e.id = _id;
        e.name = _name;
        uint updateTime = block.timestamp;

        emit EvidenceItemUpdated(_id, _name, updateTime);
    }

    /**
     * @dev Update the details of a specific stage for an evidence item.
     * @param _id The incremental id of the evidence item in this system
     * @param _stage The stage for which details are being updated.
     * @param _details The new details to be added.
     */
    function addStageDetails(
        uint256 _id,
        uint8 _stage,
        string memory _details
    ) public onlyAuthorized {
        require(
            evidenceItems[_id].id != 0,
            "Evidence item with this ID does not exist"
        );

        EvidenceItem storage e = evidenceItems[_id];

        // Ensure that the stage detail for the given stage does not exist already
        require(
            bytes(e.evidenceStageDetails[_stage].stageDetails).length == 0,
            "Stage detail already exists"
        );

        string memory _stageName = stageNames[_stage];

        e.evidenceStageDetails[_stage] = StageDetails({
            stageName: _stageName,
            stageDetails: _details,
            updateTime: block.timestamp
        });

        e.stageCount++;

        emit EvidenceStageDetailsUpdated(_id, _stage, _details);
    }

    /**
     * @dev Update the details of a specific stage for an evidence item.
     * @param _id The incremental id of the evidence item in this system
     * @param _stage The stage for which details are being updated.
     * @param _details The new details to be added.
     */
    function updateStageDetails(
        uint256 _id,
        uint8 _stage,
        string memory _details
    ) public onlyAuthorized {
        require(
            evidenceItems[_id].id != 0,
            "Evidence item with this ID does not exist"
        );
        string memory _stageName = stageNames[_stage];

        EvidenceItem storage e = evidenceItems[_id];
        e.evidenceStageDetails[_stage] = StageDetails({
            stageName: _stageName,
            stageDetails: _details,
            updateTime: block.timestamp
        });
        emit EvidenceStageDetailsUpdated(_id, _stage, _details);
    }

    /**
     * @dev Enable an address to perform authorized actions on the contract.
     * @param _address The address to be enabled.
     */
    function enableAddress(address _address) public onlyAdmin {
        authorizedAddresses[_address] = true;
        emit AddressEnabled(_address);
    }

    /**
     * @dev Disable an address from performing authorized actions on the contract.
     * @param _address The address to be disabled.
     */
    function disableAddress(address _address) public onlyAdmin {
        authorizedAddresses[_address] = false;
        emit AddressDisabled(_address);
    }

    /**
     * @dev Get all stage names.
     * @return Array of stage names.
     */
    function getStageNames() public view returns (string[] memory) {
        return stageNames;
    }

    /**
     * @dev Get all item Ids.
     * @return Array of item Ids.
     */
    function getItemIds() public view returns (uint256[] memory) {
        return itemIds;
    }

    /**
     * @dev Get the details of a specific stage for an evidence item.
     * @param _id The ID of the evidence item.
     * @param _stage The stage for which details are requested.
     * @return _stageDetails of the requested stage for the evidence item.
     */
    function getStageDetails(
        uint _id,
        uint _stage
    ) public view returns (StageDetails memory _stageDetails) {
        EvidenceItem storage e = evidenceItems[_id];
        return e.evidenceStageDetails[_stage];
    }

    /**
     * @dev Get the update time of a specific stage for an evidence item.
     * @param _id The ID of the evidence item.
     * @param _stage The stage for which the update time is requested.
     * @return The update time of the specified stage.
     */
    function getStageUpdateTime(
        uint _id,
        uint _stage
    ) public view returns (uint256) {
        EvidenceItem storage e = evidenceItems[_id];
        require(_stage < e.stageCount, "Invalid stage index");

        StageDetails storage stageDetails = e.evidenceStageDetails[_stage];
        return stageDetails.updateTime;
    }

    /**
     * @dev Get evidence items with their details within a specified range.
     * @param _startIndex The start index of the range.
     * @param _endIndex The end index of the range.
     * @return Arrays of IDs, names, add times, and stage counts for evidence items in the specified range.
     */
    function getEvidenceItemsInRange(
        uint _startIndex,
        uint _endIndex
    )
        public
        view
        returns (uint[] memory, string[] memory, uint[] memory, uint[] memory)
    {
        require(_startIndex < evidenceItemsLength, "Start index out of bounds");

        // Use _endIndex or evidenceItemsLength, whichever is smaller
        uint endIndex = _endIndex < evidenceItemsLength
            ? _endIndex
            : evidenceItemsLength;

        uint[] memory ids = new uint[](endIndex - _startIndex);
        string[] memory names = new string[](endIndex - _startIndex);
        uint[] memory addTimes = new uint[](endIndex - _startIndex);
        uint[] memory stageCounts = new uint[](endIndex - _startIndex);

        for (uint i = _startIndex; i < endIndex; i++) {
            EvidenceItem storage e = evidenceItems[itemIds[i]];
            ids[i - _startIndex] = e.id;
            names[i - _startIndex] = e.name;
            addTimes[i - _startIndex] = e.addTime;
            stageCounts[i - _startIndex] = e.stageCount;
        }

        return (ids, names, addTimes, stageCounts);
    }

    /**
     * @dev Get all details for a specific evidence item.
     * @param _id The index of the evidence item.
     * @return id , name , addTime , stageCount, allStages details of all stages for the evidence item.
     */
    function getAllEvidenceItemDetails(
        uint _id
    )
        public
        view
        returns (
            uint256 id,
            string memory name,
            uint addTime,
            uint stageCount,
            StageDetails[] memory allStages
        )
    {
        require(
            evidenceItems[_id].id != 0,
            "Evidence item with this ID does not exist"
        );
        EvidenceItem storage e = evidenceItems[_id];
        id = e.id;
        name = e.name;
        addTime = e.addTime;
        stageCount = e.stageCount;

        allStages = new StageDetails[](e.stageCount);
        for (uint i = 0; i < e.stageCount; i++) {
            allStages[i] = e.evidenceStageDetails[i];
        }
        return (id, name, addTime, stageCount, allStages);
    }
}
