# RefundVault

Source file [../../../contracts/crowdsale/RefundVault.sol](../../../contracts/crowdsale/RefundVault.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;

// BK Next 4 Ok
import '../math/SafeMath.sol';
import '../ownership/Claimable.sol';
import '../token/ERC20.sol';
import '../SirinSmartToken.sol';

/**
 * @title RefundVault
 * @dev This contract is used for storing TOKENS AND ETHER while a crowdsale is in progress for a period of 60 DAYS.
 * Investor can ask for a full/part refund for his ether against token. Once tokens are Claimed by the investor, they cannot be refunded.
 * After 60 days, all ether will be withdrawn from the vault`s wallet, leaving all tokens to be claimed by the their owners.
 **/
// BK Ok
contract RefundVault is Claimable {
    // BK Ok
    using SafeMath for uint256;

    // =================================================================================================================
    //                                      Enums
    // =================================================================================================================

    // BK Ok
    enum State { Active, Refunding, Closed }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // Refund time frame
    // BK Ok
    uint256 public constant REFUND_TIME_FRAME = 60 days;

    // BK Next 2 Ok
    mapping (address => uint256) public depositedETH;
    mapping (address => uint256) public depositedToken;

    // BK Next 4 Ok
    address public etherWallet;
    SirinSmartToken public token;
    State public state;
    uint256 public refundStartTime;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================

    // BK Next 6 Ok - Events
    event Active();
    event Closed();
    event Deposit(address indexed beneficiary, uint256 etherWeiAmount, uint256 tokenWeiAmount);
    event RefundsEnabled();
    event RefundedETH(address beneficiary, uint256 weiAmount);
    event TokensClaimed(address indexed beneficiary, uint256 weiAmount);

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================

    // BK Next modifier Ok
    modifier isActiveState() {
        require(state == State.Active);
        _;
    }

    // BK Next modifier Ok
    modifier isRefundingState() {
        require(state == State.Refunding);
        _;
    }
    
    // BK Next modifier Ok
    modifier isCloseState() {
        require(state == State.Closed);
        _;
    }

    // BK Next modifier Ok
    modifier isRefundingOrCloseState() {
        require(state == State.Refunding || state == State.Closed);
        _;
    }

    // BK Next modifier Ok
    modifier  isInRefundTimeFrame() {
        require(refundStartTime <= now && refundStartTime + REFUND_TIME_FRAME > now);
        _;
    }

    // BK Next modifier Ok
    modifier isRefundTimeFrameExceeded() {
        require(refundStartTime + REFUND_TIME_FRAME < now);
        _;
    }
    

    // =================================================================================================================
    //                                      Ctors
    // =================================================================================================================

    // BK Ok - Constructor
    function RefundVault(address _etherWallet, SirinSmartToken _token) public {
        // BK Next 2 Ok
        require(_etherWallet != address(0));
        require(_token != address(0));

        // BK Next 3 Ok
        etherWallet = _etherWallet;
        token = _token;
        state = State.Active;
        // BK Ok
        Active();
    }

    // =================================================================================================================
    //                                      Public Functions
    // =================================================================================================================

    // BK Ok - Owner will be the crowdsale contract for this call
    function deposit(address investor, uint256 tokensAmount) isActiveState onlyOwner public payable {

        // BK Ok
        depositedETH[investor] = depositedETH[investor].add(msg.value);
        // BK Ok
        depositedToken[investor] = depositedToken[investor].add(tokensAmount);

        // BK Ok - Log event
        Deposit(investor, msg.value, tokensAmount);
    }

    // BK Ok - Only owner can execute
    function close() isRefundingState onlyOwner isRefundTimeFrameExceeded public {
        // BK Ok
        state = State.Closed;
        // BK Ok - Log event
        Closed();
        // BK Ok
        etherWallet.transfer(this.balance);
    }

    // BK Ok - Only owner can execute
    function enableRefunds() isActiveState onlyOwner public {
        // BK Ok
        state = State.Refunding;
        // BK Ok
        refundStartTime = now;

        // BK Ok - Log event
        RefundsEnabled();
    }

    //@dev Refund ether back to the investor in returns of proportional amount of SRN
    //back to the Sirin`s wallet
    // BK Ok - Any investor can execute this during the refund period
    function refundETH(uint256 ETHToRefundAmountWei) isInRefundTimeFrame isRefundingState public {
        // BK Ok
        require(ETHToRefundAmountWei != 0);

        // BK Next 2 Ok
        uint256 depositedTokenValue = depositedToken[msg.sender];
        uint256 depositedETHValue = depositedETH[msg.sender];

        // BK Ok
        require(ETHToRefundAmountWei <= depositedETHValue);

        // BK Ok
        uint256 refundTokens = ETHToRefundAmountWei.mul(depositedTokenValue).div(depositedETHValue);

        // BK Ok
        assert(refundTokens > 0);

        // BK Next 2 Ok
        depositedETH[msg.sender] = depositedETHValue.sub(ETHToRefundAmountWei);
        depositedToken[msg.sender] = depositedTokenValue.sub(refundTokens);

        // BK Ok
        token.destroy(address(this),refundTokens);
        // BK Ok
        msg.sender.transfer(ETHToRefundAmountWei);

        // BK Ok - Log event
        RefundedETH(msg.sender, ETHToRefundAmountWei);
    }

    //@dev Transfer tokens from the vault to the investor while releasing proportional amount of ether
    //to Sirin`s wallet.
    //Can be triggerd by the investor only
    // BK Ok - Any guaranteed investor with with tokens/ethers can execute this
    function claimTokens(uint256 tokensToClaim) isRefundingOrCloseState public {
        // BK Ok
        require(tokensToClaim != 0);
        
        // BK Ok
        address investor = msg.sender;
        // BK Ok
        require(depositedToken[investor] > 0);
        
        // BK Next 2 Ok
        uint256 depositedTokenValue = depositedToken[investor];
        uint256 depositedETHValue = depositedETH[investor];

        // BK OK
        require(tokensToClaim <= depositedTokenValue);

        // BK OK
        uint256 claimedETH = tokensToClaim.mul(depositedETHValue).div(depositedTokenValue);

        // BK Ok
        assert(claimedETH > 0);

        // BK Next 2 Ok
        depositedETH[investor] = depositedETHValue.sub(claimedETH);
        depositedToken[investor] = depositedTokenValue.sub(tokensToClaim);

        // BK Ok
        token.transfer(investor, tokensToClaim);
        // BK Ok
        if(state != State.Closed) {
            // BK Ok
            etherWallet.transfer(claimedETH);
        }

        // BK Ok - Log event
        TokensClaimed(investor, tokensToClaim);
    }

    // @dev investors can claim tokens by calling the function
    // @param tokenToClaimAmount - amount of the token to claim
    // BK Ok - Any guaranteed investor with with tokens/ethers can execute this
    function claimAllTokens() isRefundingOrCloseState public  {
        // BK Ok
        uint256 depositedTokenValue = depositedToken[msg.sender];
        // BK Ok
        claimTokens(depositedTokenValue);
    }

}

```
