// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title EvidenceChainOfCustody
 * @dev Smart contract for managing the chain of custody of evidence items.
 */
contract EvidenceChainOfCustody {
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

    mapping(uint8 => string) public stageNames; // Mapping to store stage names
    uint8 public nextStageId; // To track the next available stage ID

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

    constructor(address _admin) {
        admin = _admin;
        nextStageId = 1; // Initialize the next stage ID to 1
        authorizedAddresses[msg.sender] = true;
    }

    /**
     * @dev Add a new stage with a specified name. Stage IDs start from 1 and are incremented.
     * @param _stageName The name of the new stage.
     */
    function addNewStage(string memory _stageName) public onlyAdmin {
        stageNames[nextStageId] = _stageName; // Store the stage name in the mapping
        emit NewStageAdded(nextStageId, _stageName);
        nextStageId++; // Increment the next available stage ID
    }

    /**
     * @dev Update the name of a specific stage.
     * @param _stageId The ID of the stage to be updated.
     * @param _newStageName The new name for the stage.
     */
    function updateStageName(
        uint8 _stageId,
        string memory _newStageName
    ) public onlyAdmin {
        require(bytes(stageNames[_stageId]).length > 0, "Stage does not exist");
        stageNames[_stageId] = _newStageName;
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
    }

    /**
     * @dev Disable an address from performing authorized actions on the contract.
     * @param _address The address to be disabled.
     */
    function disableAddress(address _address) public onlyAdmin {
        authorizedAddresses[_address] = false;
    }

    /**
     * @dev Get the name of a stage based on its ID.
     * @param _stage The ID of the stage for which the name is requested.
     * @return The name of the stage.
     */
    function getStageName(uint8 _stage) public view returns (string memory) {
        require(nextStageId > 1, "Stage does not exist");
        return stageNames[_stage];
    }

    function getStageDetails(
        uint _itemNum,
        uint _stage
    ) public view returns (StageDetails memory _stageDetails) {
        EvidenceItem storage e = evidenceItems[_itemNum];
        return e.evidenceStageDetails[_stage];
    }

   
}
