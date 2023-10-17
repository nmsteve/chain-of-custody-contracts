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

    function addAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = true;
    }

    function removeAuthorizedUser(address _userAddress) public onlyAdmin {
        authorizedUsers[_userAddress] = false;
    }

    function deployCase(uint256 _caseID) public onlyAuthorized {
        require(cases[_caseID].caseID == 0, "Case with this ID already exists");
        uint256 deploymentDate = block.timestamp;
        EvidenceChainOfCustody newCase = new EvidenceChainOfCustody();
        cases[_caseID] = Case(address(newCase), _caseID, deploymentDate, true);
        emit CaseDeployed(_caseID, address(newCase), deploymentDate);
    }

    function disableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == true, "Case is already disabled");
        cases[_caseID].active = false;
    }

    function enableCase(uint256 _caseID) public onlyAdmin {
        require(cases[_caseID].caseID != 0, "Case with this ID does not exist");
        require(cases[_caseID].active == false, "Case is already enabled");
        cases[_caseID].active = true;
    }

    function getCaseStatus(uint256 _caseID) public view returns (bool) {
        return cases[_caseID].active;
    }
}
