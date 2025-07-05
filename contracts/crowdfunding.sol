// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool isClosed;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_target > 0, "The target should be greater than 0");
        require(_deadline > block.timestamp, "The deadline should be in the future");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.isClosed = false;

        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_id];
        
        require(!campaign.isClosed, "Campaign is closed");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Donation amount must be greater than 0");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;

        // Check if target is reached
        if (campaign.amountCollected >= campaign.target) {
            campaign.isClosed = true;
            (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
            require(sent, "Failed to transfer funds to campaign owner");
        }
    }

    function withdrawFundsIfSuccessful(uint256 _id) public {
        require(_id < numberOfCampaigns, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_id];
        
        require(msg.sender == campaign.owner, "Only owner can withdraw");
        require(!campaign.isClosed, "Campaign is already closed");
        require(block.timestamp >= campaign.deadline, "Campaign deadline not reached");
        require(campaign.amountCollected >= campaign.target, "Target not reached");
        
        campaign.isClosed = true;
        (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
        require(sent, "Failed to transfer funds to campaign owner");
    }

    function refundIfUnsuccessful(uint256 _id) public {
        require(_id < numberOfCampaigns, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_id];
        
        require(!campaign.isClosed, "Campaign is already closed");
        require(block.timestamp >= campaign.deadline, "Campaign deadline not reached");
        require(campaign.amountCollected < campaign.target, "Target was reached");

        campaign.isClosed = true;
        for (uint i = 0; i < campaign.donators.length; i++) {
            (bool sent, ) = payable(campaign.donators[i]).call{value: campaign.donations[i]}("");
            require(sent, "Failed to refund donor");
        }
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for(uint i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
}