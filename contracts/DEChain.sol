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
        string[] stageDetails; // an array to store stage details
    }

    mapping(uint256 => EvidenceItem) public evidenceItems;
    mapping(address => bool) public authorizedAddresses;
    address public admin;

    string[] public stageNames; // an array to store stage names

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

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Add a new stage with a specified name.
     * @param _stageName The name of the new stage.
     */
    function addNewStage(string memory _stageName) public onlyAdmin {
        stageNames.push(_stageName);
        uint8 stageId = uint8(stageNames.length - 1); // Assign the stage ID based on the array index
        emit NewStageAdded(stageId, _stageName);
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

        EvidenceItem storage newItem = evidenceItems[_id];
        newItem.id = _id;
        newItem.name = _name;

        // Emit an event to indicate the addition of a new evidence item
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
        require(_stage < stageNames.length, "Invalid stage index");

        evidenceItems[_id].stageDetails.push(_details);
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
        require(_stage < stageNames.length, "Invalid stage index");
        return stageNames[_stage];
    }

    /**
     * @dev Get the total number of stages for a specific evidence item.
     * @param _id The ID of the evidence item.
     * @return The number of stages.
     */
    function getStageCount(uint256 _id) public view returns (uint256) {
        return evidenceItems[_id].stageDetails.length;
    }
}
