// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EvidenceChainOfCustody.sol";

contract CaseFactory {
    
    address public admin;

    struct Case {
        address caseContractAddress;
        uint256 caseID;
        uint256 deploymentDate;
        bool active;
    }

    mapping(uint256 => Case) public cases;
    mapping(address => bool) public authorizedUsers;

    event CaseDeployed(uint256 indexed caseID, address caseContractAddress, uint256 deploymentDate);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender] || msg.sender == admin, "Not authorized to deploy the chain of custody");
        _;
    }

    /**
     * @dev Add an address as an authorized user.
     * @param _userAddress The address to be authorized.
     */
    function addAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = true;
    }

    /**
     * @dev Remove an address from the list of authorized users.
     * @param _userAddress The address to be removed from the list of authorized users.
     */
    function removeAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = false;
    }

    /**
     * @dev Deploy a new case contract.
     * @param _caseID The ID of the new case.
     */
    function deployCase(uint256 _caseID, address _admin) public onlyAuthorized {
        require(cases[_caseID].caseID == 0, "Case with this ID already exists");
        uint256 deploymentDate = block.timestamp;
        EvidenceChainOfCustody newCase = new EvidenceChainOfCustody(_admin);
        cases[_caseID] = Case(address(newCase), _caseID, deploymentDate, true);
        emit CaseDeployed(_caseID, address(newCase), deploymentDate);
    }

    /**
     * @dev Disable a case, preventing further actions.
     * @param _caseID The ID of the case to be disabled.
     */
    function disableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == true, "Case is already disabled");
        cases[_caseID].active = false;
    }

    /**
     * @dev Enable a case, allowing actions to be performed.
     * @param _caseID The ID of the case to be enabled.
     */
    function enableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == false, "Case is already enabled");
        cases[_caseID].active = true;
    }

    /**
     * @dev Get the status of a case (active or disabled).
     * @param _caseID The ID of the case for which the status is requested.
     * @return The status of the case.
     */
    function getCaseStatus(uint256 _caseID) public view returns (bool) {
        return cases[_caseID].active;
    }
}
