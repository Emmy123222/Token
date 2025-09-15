// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PatientSponsorship is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    struct Campaign {
        uint256 id;
        address patient;
        uint256 fundingGoal;
        uint256 currentFunding;
        string ipfsHash;
        bool isActive;
        bool goalReached;
        uint256 createdAt;
        address[] sponsors;
        mapping(address => uint256) sponsorContributions;
    }
    
    struct ImpactNFT {
        uint256 campaignId;
        address sponsor;
        uint256 contribution;
        uint256 mintedAt;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => ImpactNFT) public impactNFTs;
    mapping(address => uint256[]) public patientCampaigns;
    mapping(address => uint256[]) public sponsorImpactNFTs;
    
    IERC20 public usdcToken;
    IERC20 public livesToken;
    
    uint256[] public activeCampaigns;
    
    event CampaignCreated(uint256 indexed campaignId, address indexed patient, uint256 fundingGoal, string ipfsHash);
    event ContributionMade(uint256 indexed campaignId, address indexed sponsor, uint256 amount);
    event GoalReached(uint256 indexed campaignId, uint256 totalFunding);
    event ImpactNFTMinted(uint256 indexed tokenId, uint256 indexed campaignId, address indexed sponsor);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed patient, uint256 amount);
    
    constructor(address _usdcToken, address _livesToken) ERC721("Impact Sponsorship NFT", "IMPACT") {
        usdcToken = IERC20(_usdcToken);
        livesToken = IERC20(_livesToken);
    }
    
    function createCampaign(uint256 _fundingGoal, string memory _ipfsHash) external returns (uint256) {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        uint256 campaignId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        Campaign storage newCampaign = campaigns[campaignId];
        newCampaign.id = campaignId;
        newCampaign.patient = msg.sender;
        newCampaign.fundingGoal = _fundingGoal;
        newCampaign.currentFunding = 0;
        newCampaign.ipfsHash = _ipfsHash;
        newCampaign.isActive = true;
        newCampaign.goalReached = false;
        newCampaign.createdAt = block.timestamp;
        
        activeCampaigns.push(campaignId);
        patientCampaigns[msg.sender].push(campaignId);
        
        // Mint patient sponsorship NFT
        _safeMint(msg.sender, campaignId);
        _setTokenURI(campaignId, _ipfsHash);
        
        emit CampaignCreated(campaignId, msg.sender, _fundingGoal, _ipfsHash);
        return campaignId;
    }
    
    function contributeUSDC(uint256 _campaignId, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Contribution must be greater than 0");
        require(campaigns[_campaignId].isActive, "Campaign not active");
        require(!campaigns[_campaignId].goalReached, "Goal already reached");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        
        // Add to sponsors if first contribution
        if (campaign.sponsorContributions[msg.sender] == 0) {
            campaign.sponsors.push(msg.sender);
        }
        
        campaign.sponsorContributions[msg.sender] += _amount;
        campaign.currentFunding += _amount;
        
        emit ContributionMade(_campaignId, msg.sender, _amount);
        
        // Check if goal reached
        if (campaign.currentFunding >= campaign.fundingGoal && !campaign.goalReached) {
            campaign.goalReached = true;
            emit GoalReached(_campaignId, campaign.currentFunding);
            
            // Mint Impact NFTs for all sponsors
            _mintImpactNFTsForCampaign(_campaignId);
        }
    }
    
    function contributeLIVES(uint256 _campaignId, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Contribution must be greater than 0");
        require(campaigns[_campaignId].isActive, "Campaign not active");
        require(!campaigns[_campaignId].goalReached, "Goal already reached");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        require(livesToken.transferFrom(msg.sender, address(this), _amount), "LIVES transfer failed");
        
        // Add to sponsors if first contribution
        if (campaign.sponsorContributions[msg.sender] == 0) {
            campaign.sponsors.push(msg.sender);
        }
        
        campaign.sponsorContributions[msg.sender] += _amount;
        campaign.currentFunding += _amount;
        
        emit ContributionMade(_campaignId, msg.sender, _amount);
        
        // Check if goal reached
        if (campaign.currentFunding >= campaign.fundingGoal && !campaign.goalReached) {
            campaign.goalReached = true;
            emit GoalReached(_campaignId, campaign.currentFunding);
            
            // Mint Impact NFTs for all sponsors
            _mintImpactNFTsForCampaign(_campaignId);
        }
    }
    
    function _mintImpactNFTsForCampaign(uint256 _campaignId) internal {
        Campaign storage campaign = campaigns[_campaignId];
        
        for (uint i = 0; i < campaign.sponsors.length; i++) {
            address sponsor = campaign.sponsors[i];
            uint256 contribution = campaign.sponsorContributions[sponsor];
            
            uint256 impactTokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(sponsor, impactTokenId);
            _setTokenURI(impactTokenId, campaign.ipfsHash);
            
            impactNFTs[impactTokenId] = ImpactNFT({
                campaignId: _campaignId,
                sponsor: sponsor,
                contribution: contribution,
                mintedAt: block.timestamp
            });
            
            sponsorImpactNFTs[sponsor].push(impactTokenId);
            
            emit ImpactNFTMinted(impactTokenId, _campaignId, sponsor);
        }
    }
    
    function withdrawFunds(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.patient == msg.sender, "Only patient can withdraw");
        require(campaign.goalReached, "Goal not reached yet");
        require(campaign.isActive, "Campaign not active");
        
        uint256 amount = campaign.currentFunding;
        campaign.isActive = false;
        
        // Transfer USDC to patient (simplified - in production, track token types)
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit FundsWithdrawn(_campaignId, msg.sender, amount);
    }
    
    function getActiveCampaigns() external view returns (uint256[] memory) {
        return activeCampaigns;
    }
    
    function getCampaignSponsors(uint256 _campaignId) external view returns (address[] memory) {
        return campaigns[_campaignId].sponsors;
    }
    
    function getSponsorContribution(uint256 _campaignId, address _sponsor) external view returns (uint256) {
        return campaigns[_campaignId].sponsorContributions[_sponsor];
    }
    
    function getPatientCampaigns(address _patient) external view returns (uint256[] memory) {
        return patientCampaigns[_patient];
    }
    
    function getSponsorImpactNFTs(address _sponsor) external view returns (uint256[] memory) {
        return sponsorImpactNFTs[_sponsor];
    }
}