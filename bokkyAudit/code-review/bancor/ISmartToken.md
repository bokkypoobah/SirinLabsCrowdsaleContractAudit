# ISmartToken

Source file [../../../contracts/bancor/ISmartToken.sol](../../../contracts/bancor/ISmartToken.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;

/*
    Smart Token interface
*/
// BK Ok
contract ISmartToken {

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // BK Ok
    bool public transfersEnabled = false;

    // =================================================================================================================
    //                                      Event
    // =================================================================================================================

    // triggered when a smart token is deployed - the _token address is defined for forward compatibility, in case we want to trigger the event from a factory
    // BK Ok - Event
    event NewSmartToken(address _token);
    // triggered when the total supply is increased
    // BK Ok - Event
    event Issuance(uint256 _amount);
    // triggered when the total supply is decreased
    // BK Ok - Event
    event Destruction(uint256 _amount);

    // =================================================================================================================
    //                                      Functions
    // =================================================================================================================

    // BK Ok - Next 3 Ok
    function disableTransfers(bool _disable) public;
    function issue(address _to, uint256 _amount) public;
    function destroy(address _from, uint256 _amount) public;
}
```
