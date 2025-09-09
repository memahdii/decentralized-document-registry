// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DocumentRegistry
 * @dev Stores metadata for documents on IPFS.
 */
contract DocumentRegistry {
    
    struct Document {
        uint id;
        string docHash;
        address owner;
        string category;
        string authors;
        uint deadline;
        uint uploadTimestamp;
    }

    uint256 private _documentIdCounter;
    mapping(uint256 => Document) public documents;
    mapping(address => uint256[]) private _docsByOwner;
    mapping(bytes32 => uint256[]) private _docsByCategory;

    event DocumentUploaded(
        uint256 indexed id,
        address indexed owner,
        string category,
        string authors,
        uint256 deadline,
        string docHash
    );

    function uploadDocument(
        string memory _docHash,
        string memory _category,
        string memory _authors,
        uint256 _deadline
    ) public {
        require(bytes(_docHash).length > 0, "Document hash cannot be empty");
        
        _documentIdCounter++;
        uint256 newId = _documentIdCounter;
        
        documents[newId] = Document({
            id: newId,
            docHash: _docHash,
            owner: msg.sender,
            category: _category,
            authors: _authors,
            deadline: _deadline,
            uploadTimestamp: block.timestamp
        });

        _docsByOwner[msg.sender].push(newId);
        _docsByCategory[keccak256(abi.encodePacked(_category))].push(newId);

        emit DocumentUploaded(newId, msg.sender, _category, _authors, _deadline, _docHash);
    }

    function getTotalDocuments() public view returns (uint256) {
        return _documentIdCounter;
    }

    function getDocumentsByOwner(address _owner) external view returns (uint256[] memory) {
        return _docsByOwner[_owner];
    }

    function getDocumentsByCategory(string calldata _category) external view returns (uint256[] memory) {
        return _docsByCategory[keccak256(abi.encodePacked(_category))];
    }
}