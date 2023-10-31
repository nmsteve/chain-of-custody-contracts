// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EvidenceChainOfCustody
 * @dev Smart contract for managing the chain of custody of evidence items.
 */
contract EvidenceChainOfCustody {

    struct EvidenceItem {
        uint256 id;
        string name;
    }

    mapping(uint256 => EvidenceItem) public evidenceItems;
    mapping(uint256 => mapping(uint8 => string)) public evidenceStageDetails; // Mapping to store evidence stage details

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
    event EvidenceItemAdded(uint256 id, string name);


    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == admin || authorizedAddresses[msg.sender], "Not authorized");
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
    function updateStageName(uint8 _stageId, string memory _newStageName) public onlyAdmin {
        require(bytes(stageNames[_stageId]).length > 0, "Stage does not exist");
        stageNames[_stageId] = _newStageName;
    }
    /**
     * @dev Add a new evidence item with the specified ID and name.
     * @param _id The ID of the evidence item.
     * @param _name The name of the evidence item.
     */
    function addEvidenceItem(uint256 _id, string memory _name) public onlyAuthorized {
        require(
            evidenceItems[_id].id == 0,
            "Evidence item with this ID already exists"
        );

        evidenceItems[_id] = EvidenceItem(_id, _name);
        emit EvidenceItemAdded(_id, _name);
    }

    /**
     * @dev Update the details of a specific stage for an evidence item.
     * @param _id The ID of the evidence item.
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
        evidenceStageDetails[_id][_stage] = _details;
        emit EvidenceStageDetailsUpdated(_id, _stage, _details);
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
        require(nextStageId > 1,"Stage does not exist");
        return stageNames[_stage];
    }

    /**
     * @dev Get the total number of stages for a specific evidence item.
     * @param _id The ID of the evidence item.
     * @return The number of stages.
     */
    function getStageCount(uint256 _id) public view returns (uint8) {
        require(
            evidenceItems[_id].id != 0,
            "Evidence item with this ID does not exist"
        );
        uint8 count = 1;
        while (bytes(evidenceStageDetails[_id][count]).length > 0) {
            count++;
        }
        return count-1;
    }
}
