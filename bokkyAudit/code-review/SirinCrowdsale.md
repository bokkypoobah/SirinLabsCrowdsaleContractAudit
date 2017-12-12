# SirinCrowdsale

Source file [../../contracts/SirinCrowdsale.sol](../../contracts/SirinCrowdsale.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;


// BK Next 4 Ok
import './crowdsale/RefundVault.sol';
import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';
import './SirinSmartToken.sol';


// BK Ok
contract SirinCrowdsale is FinalizableCrowdsale {

    // =================================================================================================================
    //                                      Constants
    // =================================================================================================================
    // Max amount of known addresses of which will get SRN by 'Grant' method.
    //
    // grantees addresses will be SirinLabs wallets addresses.
    // these wallets will contain SRN tokens that will be used for 2 purposes only -
    // 1. SRN tokens against raised fiat money
    // 2. SRN tokens for presale bonus.
    // we set the value to 10 (and not to 2) because we want to allow some flexibility for cases like fiat money that is raised close to the crowdsale.
    // we limit the value to 10 (and not larger) to limit the run time of the function that process the grantees array.
    // BK Ok
    uint8 public constant MAX_TOKEN_GRANTEES = 10;

    // SRN to ETH base rate
    // BK Ok
    uint256 public constant EXCHANGE_RATE = 500;

    // Refund division rate
    // BK Ok
    uint256 public constant REFUND_DIVISION_RATE = 2;

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================

    /**
     * @dev Throws if called not during the crowdsale time frame
     */
    // BK Ok
    modifier onlyWhileSale() {
        // BK Ok
        require(isActive());
        // BK Ok
        _;
    }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // wallets address for 60% of SRN allocation
    // BK Next 4 Ok
    address public walletTeam;   //10% of the total number of SRN tokens will be allocated to the team
    address public walletOEM;       //10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation, SDK developers and rebate to device and Shield OS™ users
    address public walletBounties;  //5% of the total number of SRN tokens will be allocated to professional fees and Bounties
    address public walletReserve;   //35% of the total number of SRN tokens will be allocated to SIRIN LABS and as a reserve for the company to be used for future strategic plans for the created ecosystem

    // Funds collected outside the crowdsale in wei
    // BK Ok
    uint256 public fiatRaisedConvertedToWei;

    //Grantees - used for non-ether and presale bonus token generation
    // BK Ok
    address[] public presaleGranteesMapKeys;
    // BK Ok
    mapping (address => uint256) public presaleGranteesMap;  //address=>wei token amount

    // The refund vault
    // BK Ok
    RefundVault public refundVault;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================
    // BK Next 5 Ok - Event
    event GrantAdded(address indexed _grantee, uint256 _amount);

    event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);

    event GrantDeleted(address indexed _grantee, uint256 _hadAmount);

    event FiatRaisedUpdated(address indexed _address, uint256 _fiatRaised);

    event TokenPurchaseWithGuarantee(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    // =================================================================================================================
    //                                      Constructors
    // =================================================================================================================

    // BK Ok - Constructor
    function SirinCrowdsale(uint256 _startTime,
    uint256 _endTime,
    address _wallet,
    address _walletTeam,
    address _walletOEM,
    address _walletBounties,
    address _walletReserve,
    SirinSmartToken _sirinSmartToken,
    RefundVault _refundVault)
    public
    Crowdsale(_startTime, _endTime, EXCHANGE_RATE, _wallet, _sirinSmartToken) {
        // BK Next 6 Ok
        require(_walletTeam != address(0));
        require(_walletOEM != address(0));
        require(_walletBounties != address(0));
        require(_walletReserve != address(0));
        require(_sirinSmartToken != address(0));
        require(_refundVault != address(0));

        // BK Next 4 Ok
        walletTeam = _walletTeam;
        walletOEM = _walletOEM;
        walletBounties = _walletBounties;
        walletReserve = _walletReserve;

        // BK Next 2 Ok
        token = _sirinSmartToken;
        refundVault  = _refundVault;
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the rate in SRN per 1 ETH according to the time of the tx and the SRN pricing program.
    // @Override
    // BK Ok - View function
    function getRate() public view returns (uint256) {
        // BK Next block Ok
        if (now < (startTime.add(24 hours))) {return 1000;}
        if (now < (startTime.add(2 days))) {return 950;}
        if (now < (startTime.add(3 days))) {return 900;}
        if (now < (startTime.add(4 days))) {return 855;}
        if (now < (startTime.add(5 days))) {return 810;}
        if (now < (startTime.add(6 days))) {return 770;}
        if (now < (startTime.add(7 days))) {return 730;}
        if (now < (startTime.add(8 days))) {return 690;}
        if (now < (startTime.add(9 days))) {return 650;}
        if (now < (startTime.add(10 days))) {return 615;}
        if (now < (startTime.add(11 days))) {return 580;}
        if (now < (startTime.add(12 days))) {return 550;}
        if (now < (startTime.add(13 days))) {return 525;}

        // BK Ok - 500
        return rate;
    }

    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    // BK Ok - Only owner can execute
    function finalization() internal onlyOwner {
        // BK Ok
        super.finalization();

        // granting bonuses for the pre crowdsale grantees:
        // BK Ok
        for (uint256 i = 0; i < presaleGranteesMapKeys.length; i++) {
            // BK Ok
            token.issue(presaleGranteesMapKeys[i], presaleGranteesMap[presaleGranteesMapKeys[i]]);
        }

        // Adding 60% of the total token supply (40% were generated during the crowdsale)
        // 40 * 2.5 = 100
        // BK Ok
        uint256 newTotalSupply = token.totalSupply().mul(250).div(100);

        // 10% of the total number of SRN tokens will be allocated to the team
        // BK Ok
        token.issue(walletTeam, newTotalSupply.mul(10).div(100));

        // 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        // SDK developers and rebate to device and Sirin OS™ users
        // BK Ok
        token.issue(walletOEM, newTotalSupply.mul(10).div(100));

        // 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        // BK Ok
        token.issue(walletBounties, newTotalSupply.mul(5).div(100));

        // 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        // and as a reserve for the company to be used for future strategic plans for the created ecosystem
        // BK Ok
        token.issue(walletReserve, newTotalSupply.mul(35).div(100));

        // Re-enable transfers after the token sale.
        // BK Ok
        token.disableTransfers(false);

        // Re-enable destroy function after the token sale.
        // BK Ok
        token.setDestroyEnabled(true);

        // Enable ETH refunds and token claim.
        // BK Ok
        refundVault.enableRefunds();

        // transfer token ownership to crowdsale owner
        // BK Ok
        token.transferOwnership(owner);

        // transfer refundVault ownership to crowdsale owner
        // BK Ok
        refundVault.transferOwnership(owner);
    }

    // =================================================================================================================
    //                                      Public Methods
    // =================================================================================================================
    // @return the total funds collected in wei(ETH and none ETH).
    // BK Ok - View function
    function getTotalFundsRaised() public view returns (uint256) {
        // BK Ok
        return fiatRaisedConvertedToWei.add(weiRaised);
    }

    // @return true if the crowdsale is active, hence users can buy tokens
    // BK Ok - View function
    function isActive() public view returns (bool) {
        // BK Ok
        return now >= startTime && now < endTime;
    }

    // =================================================================================================================
    //                                      External Methods
    // =================================================================================================================
    // @dev Adds/Updates address and token allocation for token grants.
    // Granted tokens are allocated to non-ether, presale, buyers.
    // @param _grantee address The address of the token grantee.
    // @param _value uint256 The value of the grant in wei token.
    // BK Ok - Only owner can execute
    function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner onlyWhileSale{
        // BK Next 2 Ok
        require(_grantee != address(0));
        require(_value > 0);

        // Adding new key if not present:
        // BK Ok
        if (presaleGranteesMap[_grantee] == 0) {
            // BK Ok
            require(presaleGranteesMapKeys.length < MAX_TOKEN_GRANTEES);
            // BK Ok
            presaleGranteesMapKeys.push(_grantee);
            // BK Ok - Log event
            GrantAdded(_grantee, _value);
        }
        // BK Ok
        else {
            // BK Ok - Log event
            GrantUpdated(_grantee, presaleGranteesMap[_grantee], _value);
        }

        // BK Ok
        presaleGranteesMap[_grantee] = _value;
    }

    // @dev deletes entries from the grants list.
    // @param _grantee address The address of the token grantee.
    // BK Ok - Only owner can execute
    function deleteGrantee(address _grantee) external onlyOwner onlyWhileSale {
        // BK Ok
        require(_grantee != address(0));
        // BK Ok
        require(presaleGranteesMap[_grantee] != 0);

        //delete from the map:
        // BK Ok
        delete presaleGranteesMap[_grantee];

        //delete from the array (keys):
        // BK Ok
        uint256 index;
        // BK Ok
        for (uint256 i = 0; i < presaleGranteesMapKeys.length; i++) {
            // BK Ok
            if (presaleGranteesMapKeys[i] == _grantee) {
                // BK Ok
                index = i;
                // BK Ok
                break;
            }
        }
        // BK Ok
        presaleGranteesMapKeys[index] = presaleGranteesMapKeys[presaleGranteesMapKeys.length - 1];
        // BK Ok
        delete presaleGranteesMapKeys[presaleGranteesMapKeys.length - 1];
        // BK Ok
        presaleGranteesMapKeys.length--;

        // BK Ok - Log event
        GrantDeleted(_grantee, presaleGranteesMap[_grantee]);
    }

    // @dev Set funds collected outside the crowdsale in wei.
    //  note: we not to use accumulator to allow flexibility in case of humane mistakes.
    // funds are converted to wei using the market conversion rate of USD\ETH on the day on the purchase.
    // @param _fiatRaisedConvertedToWei number of none eth raised.
    // BK Ok - Only owner can execute
    function setFiatRaisedConvertedToWei(uint256 _fiatRaisedConvertedToWei) external onlyOwner onlyWhileSale {
        // BK Ok
        fiatRaisedConvertedToWei = _fiatRaisedConvertedToWei;
        // BK Ok - Log event
        FiatRaisedUpdated(msg.sender, fiatRaisedConvertedToWei);
    }

    /// @dev Accepts new ownership on behalf of the SirinCrowdsale contract. This can be used, by the token sale
    /// contract itself to claim back ownership of the SirinSmartToken contract.
    // BK Ok - Only owner can execute
    function claimTokenOwnership() external onlyOwner {
        // BK Ok
        token.claimOwnership();
    }

    /// @dev Accepts new ownership on behalf of the SirinCrowdsale contract. This can be used, by the token sale
    /// contract itself to claim back ownership of the refundVault contract.
    // BK Ok - Only owner can execute
    function claimRefundVaultOwnership() external onlyOwner {
        // BK Ok
        refundVault.claimOwnership();
    }

    // @dev Buy tokes with guarantee
    // BK Ok
    function buyTokensWithGuarantee() public payable {
        // BK Ok
        require(validPurchase());

        // BK Ok
        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        // BK Next 2 Ok
        uint256 tokens = weiAmount.mul(getRate());
        tokens = tokens.div(REFUND_DIVISION_RATE);

        // update state
        // BK Ok
        weiRaised = weiRaised.add(weiAmount);

        // BK Ok
        token.issue(address(refundVault), tokens);

        // BK Ok
        refundVault.deposit.value(msg.value)(msg.sender, tokens);

        // BK Ok - Log event
        TokenPurchaseWithGuarantee(msg.sender, address(refundVault), weiAmount, tokens);
    }
}

```
