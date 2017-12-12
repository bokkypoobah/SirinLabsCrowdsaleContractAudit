# LimitedTransferToken

Source file [../../../contracts/token/LimitedTransferToken.sol](../../../contracts/token/LimitedTransferToken.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;

// BK Ok
import "./ERC20.sol";

/**
 * @title LimitedTransferToken
 * @dev LimitedTransferToken defines the generic interface and the implementation to limit token
 * transferability for different events. It is intended to be used as a base class for other token
 * contracts.
 * LimitedTransferToken has been designed to allow for different limiting factors,
 * this can be achieved by recursively calling super.transferableTokens() until the base class is
 * hit. For example:
 *     function transferableTokens(address holder, uint64 time) constant public returns (uint256) {
 *       return min256(unlockedTokens, super.transferableTokens(holder, time));
 *     }
 * A working example is VestedToken.sol:
 * https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/VestedToken.sol
 */

// BK Ok
contract LimitedTransferToken is ERC20 {

  /**
   * @dev Checks whether it can transfer or otherwise throws.
   */
  // BK Ok
  modifier canTransfer(address _sender, uint256 _value) {
   // BK Ok
   require(_value <= transferableTokens(_sender, uint64(now)));
   // BK Ok
   _;
  }

  /**
   * @dev Checks modifier and allows transfer if tokens are not locked.
   * @param _to The address that will receive the tokens.
   * @param _value The amount of tokens to be transferred.
   */
  // BK Ok
  function transfer(address _to, uint256 _value) canTransfer(msg.sender, _value) public returns (bool) {
    // BK Ok
    return super.transfer(_to, _value);
  }

  /**
  * @dev Checks modifier and allows transfer if tokens are not locked.
  * @param _from The address that will send the tokens.
  * @param _to The address that will receive the tokens.
  * @param _value The amount of tokens to be transferred.
  */
  // BK Ok
  function transferFrom(address _from, address _to, uint256 _value) canTransfer(_from, _value) public returns (bool) {
    // BK Ok
    return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev Default transferable tokens function returns all tokens for a holder (no limit).
   * @dev Overwriting transferableTokens(address holder, uint64 time) is the way to provide the
   * specific logic for limiting token transferability for a holder over time.
   */
  // BK Ok
  function transferableTokens(address holder, uint64 time) public view returns (uint256) {
    // BK Ok
    return balanceOf(holder);
  }
}

```
