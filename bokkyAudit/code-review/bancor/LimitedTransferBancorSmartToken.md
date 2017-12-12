# LimitedTransferBancorSmartToken

Source file [../../../contracts/bancor/LimitedTransferBancorSmartToken.sol](../../../contracts/bancor/LimitedTransferBancorSmartToken.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;

// BK Next 3 Ok
import '../token/MintableToken.sol';
import '../token/LimitedTransferToken.sol';
import './ISmartToken.sol';

/**
    BancorSmartToken
*/
// BK Ok
contract LimitedTransferBancorSmartToken is MintableToken, ISmartToken, LimitedTransferToken {

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================

    /**
     * @dev Throws if destroy flag is not enabled.
     */
    // BK Ok
    modifier canDestroy() {
        // BK Ok
        require(destroyEnabled);
        // BK Ok
        _;
    }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // We add this flag to avoid users and owner from destroy tokens during crowdsale,
    // This flag is set to false by default and blocks destroy function,
    // We enable destroy option on finalize, so destroy will be possible after the crowdsale.
    // BK Ok
    bool public destroyEnabled = false;

    // =================================================================================================================
    //                                      Public Functions
    // =================================================================================================================

    // BK Ok - Only owner can execute
    function setDestroyEnabled(bool _enable) onlyOwner public {
        // BK Ok
        destroyEnabled = _enable;
    }

    // =================================================================================================================
    //                                      Impl ISmartToken
    // =================================================================================================================

    //@Override
    // BK Ok - Only owner can execute
    function disableTransfers(bool _disable) onlyOwner public {
        // BK Ok
        transfersEnabled = !_disable;
    }

    //@Override
    // BK Ok - Only owner can execute
    function issue(address _to, uint256 _amount) onlyOwner public {
        // BK Ok
        require(super.mint(_to, _amount));
        // BK Ok - Log event
        Issuance(_amount);
    }

    //@Override
    // BK Ok - Token contract owner or token owner can destroy tokens 
    function destroy(address _from, uint256 _amount) canDestroy public {

        // BK Ok
        require(msg.sender == _from || msg.sender == owner); // validate input

        // BK Ok
        balances[_from] = balances[_from].sub(_amount);
        // BK Ok
        totalSupply = totalSupply.sub(_amount);

        // BK Next 2 Ok - Log events
        Destruction(_amount);
        Transfer(_from, 0x0, _amount);
    }

    // =================================================================================================================
    //                                      Impl LimitedTransferToken
    // =================================================================================================================


    // Enable/Disable token transfer
    // Tokens will be locked in their wallets until the end of the Crowdsale.
    // @holder - token`s owner
    // @time - not used (framework unneeded functionality)
    //
    // @Override
    // BK Ok
    function transferableTokens(address holder, uint64 time) public constant returns (uint256) {
        // BK Ok
        require(transfersEnabled);
        // BK Ok
        return super.transferableTokens(holder, time);
    }
}

```
