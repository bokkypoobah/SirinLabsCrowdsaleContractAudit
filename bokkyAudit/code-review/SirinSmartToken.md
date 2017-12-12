# SirinSmartToken

Source file [../../contracts/SirinSmartToken.sol](../../contracts/SirinSmartToken.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;


// BK Ok
import './bancor/LimitedTransferBancorSmartToken.sol';


/**
  A Token which is 'Bancor' compatible and can mint new tokens and pause token-transfer functionality
*/
// BK Ok
contract SirinSmartToken is LimitedTransferBancorSmartToken {

    // =================================================================================================================
    //                                         Members
    // =================================================================================================================

    // BK Ok
    string public name = "SIRIN";

    // BK Ok
    string public symbol = "SRN";

    // BK Ok
    uint8 public decimals = 18;

    // =================================================================================================================
    //                                         Constructor
    // =================================================================================================================

    // BK Ok - Constructor
    function SirinSmartToken() public {
        //Apart of 'Bancor' computability - triggered when a smart token is deployed
        // BK Ok - Log event
        NewSmartToken(address(this));
    }
}

```
