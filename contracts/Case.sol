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
    uint public numEvidenceItems;

    string[] public stageNames; // Mapping to store stage names

    mapping(address => bool) public authorizedAddresses;
    address public admin;

    event EvidenceStageDetailsUpdated(
        uint256 indexed itemId,
        uint8 stage,
        string newDetails
    );

    event NewStageAdded(uint8 stage, string stageName);
    event EvidenceItemAdded(
        uint _numEvidenceItem,
        uint256 id,
        string name,
        uint timeStamp
    );
   event AddressEnabled(address enabledAddress); // Event for enabling an address
    event AddressDisabled(address disabledAddress);

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

    constructor(address _admin, string[] memory _stages) {
        admin = _admin;
        authorizedAddresses[msg.sender] = true;
        stageNames = _stages;
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
        uint evidenceItemNum = numEvidenceItems++;

        EvidenceItem storage e = evidenceItems[evidenceItemNum];
        e.id = _id;
        e.name = _name;
        e.addTime = block.timestamp;

        emit EvidenceItemAdded(evidenceItemNum, _id, _name, block.timestamp);
    }

    /**
     * @dev Update the details of a specific stage for an evidence item.
     * @param _itemId The incremental id of the evidence item in this system
     * @param _stage The stage for which details are being updated.
     * @param _details The new details to be added.
     */
    function addStageDetails(
        uint256 _itemId,
        uint8 _stage,
        string memory _details
    ) public onlyAuthorized {
        require(evidenceItems[_itemId].id != 0,'Evidence item with this ID does not exist');

        string memory _stageName = stageNames[_stage];

        EvidenceItem storage e = evidenceItems[_itemId];
        e.evidenceStageDetails[_stage] = StageDetails({
            stageName: _stageName,
            stageDetails: _details,
            updateTime: block.timestamp
        });
        e.stageCount++;
        emit EvidenceStageDetailsUpdated(_itemId, _stage, _details);
    }

    /**
     * @dev Update the details of a specific stage for an evidence item.
     * @param _itemId The incremental id of the evidence item in this system
     * @param _stage The stage for which details are being updated.
     * @param _details The new details to be added.
     */
    function updateStageDetails(
        uint256 _itemId,
        uint8 _stage,
        string memory _details
    ) public onlyAuthorized {
        require(
            evidenceItems[_itemId].id != 0,
            "Evidence item with this ID does not exist"
        );
        string memory _stageName = stageNames[_stage];

        EvidenceItem storage e = evidenceItems[_itemId];
        e.evidenceStageDetails[_stage] = StageDetails({
            stageName: _stageName,
            stageDetails: _details,
            updateTime: block.timestamp
        });
        emit EvidenceStageDetailsUpdated(_itemId, _stage, _details);
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
     * @dev Get the names of all evidence stage
     * @return array of  names of the stages.
     */
    function getStageNames() public view returns (string[] memory) {
        return stageNames;
    }

    /**
     * @dev Get the details of a specific stage for an evidence item.
     * @param _itemNum The ID of the evidence item.
     * @param _stage The stage for which details are requested.
     * @return _stageDetails of the requested stage for the evidence item.
     */
    function getStageDetails(uint _itemNum, uint _stage) public view returns (StageDetails memory _stageDetails) {
        EvidenceItem storage e = evidenceItems[_itemNum];
        return e.evidenceStageDetails[_stage];
    }

    /**
     * @dev Get all evidence items with their details.
     * @return Arrays of IDs, names, add times for all evidence items.
     */
    function getAllEvidenceItems() public view returns (uint[] memory, string[] memory, uint[] memory,uint[] memory) {
        uint[] memory ids = new uint[](numEvidenceItems);
        string[] memory names = new string[](numEvidenceItems);
        uint[] memory addTimes = new uint[](numEvidenceItems);
        uint[] memory stageCounts = new uint[](numEvidenceItems);

        for (uint i = 0; i < numEvidenceItems; i++) {
            EvidenceItem storage e = evidenceItems[i];
            ids[i] = e.id;
            names[i] = e.name;
            addTimes[i] = e.addTime;
            stageCounts[i] = e.stageCount;
        }
        return (ids, names, addTimes, stageCounts);
    }

    /**
     * @dev Get all details for a specific evidence item.
     * @param _itemNum The index of the evidence item.
     * @return id , name , addTime , stageCount, allStages details of all stages for the evidence item.
     */
    function getAllEvidenceItemDetails(uint _itemNum) public view returns (uint256 id, string memory name, uint addTime, uint stageCount, StageDetails[] memory allStages) {
        require(evidenceItems[_itemNum].id != 0, "Evidence item with this ID does not exist");
        EvidenceItem storage e = evidenceItems[_itemNum];
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
