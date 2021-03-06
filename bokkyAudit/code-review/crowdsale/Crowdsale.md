# Crowdsale

Source file [../../../contracts/crowdsale/Crowdsale.sol](../../../contracts/crowdsale/Crowdsale.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;


// BK Next 3 Ok
import '../token/MintableToken.sol';
import '../math/SafeMath.sol';
import '../SirinSmartToken.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
// BK Ok
contract Crowdsale {
    // BK Ok
    using SafeMath for uint256;

    // The token being sold
    // BK Ok
    SirinSmartToken public token;

    // start and end timestamps where investments are allowed (both inclusive)
    // BK Ok
    uint256 public startTime;

    // BK Ok
    uint256 public endTime;

    // address where funds are collected
    // BK Ok
    address public wallet;

    // how many token units a buyer gets per wei
    // BK Ok
    uint256 public rate;

    // amount of raised money in wei
    // BK Ok
    uint256 public weiRaised;

    /**
     * event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    // BK Ok - Event
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    // BK Ok - Constructor
    function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, SirinSmartToken _token) public {
        // BK Next 5 Ok
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_rate > 0);
        require(_wallet != address(0));
        require(_token != address(0));

        // BK Next 5 Ok
        startTime = _startTime;
        endTime = _endTime;
        rate = _rate;
        wallet = _wallet;
        token = _token;
    }

    // fallback function can be used to buy tokens
    // BK Ok
    function() external payable {
        // BK Ok
        buyTokens(msg.sender);
    }

    // low level token purchase function
    // BK Ok
    function buyTokens(address beneficiary) public payable {
        // BK Ok
        require(beneficiary != address(0));
        // BK Ok
        require(validPurchase());

        // BK Ok
        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        // BK Ok
        uint256 tokens = weiAmount.mul(getRate());

        // update state
        // BK Ok
        weiRaised = weiRaised.add(weiAmount);

        // BK Ok
        token.issue(beneficiary, tokens);
        // BK Ok - Log event
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        // BK Ok
        forwardFunds();
    }

    // send ether to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    // BK Ok - Internal
    function forwardFunds() internal {
        // BK Ok
        wallet.transfer(msg.value);
    }

    // @return true if the transaction can buy tokens
    // BK Ok - View function
    function validPurchase() internal view returns (bool) {
        // BK Ok
        bool withinPeriod = now >= startTime && now <= endTime;
        // BK Ok
        bool nonZeroPurchase = msg.value != 0;
        // BK Ok
        return withinPeriod && nonZeroPurchase;
    }

    // @return true if crowdsale event has ended
    // BK Ok - View function
    function hasEnded() public view returns (bool) {
        // BK Ok
        return now > endTime;
    }

    // @return the crowdsale rate
    // BK Ok - View function
    function getRate() public view returns (uint256) {
        // BK Ok
        return rate;
    }


}

```
