# MintableToken

Source file [../../../contracts/token/MintableToken.sol](../../../contracts/token/MintableToken.sol).

<br />

<hr />

```javascript
// BK Ok
pragma solidity ^0.4.18;


// BK Next 2 Ok
import './StandardToken.sol';
import '../ownership/Claimable.sol';


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

// BK Ok
contract MintableToken is StandardToken, Claimable {
  // BK Next 2 Ok - Events
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  // BK Ok
  bool public mintingFinished = false;


  // BK Ok
  modifier canMint() {
    // BK Ok
    require(!mintingFinished);
    // BK Ok
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  // BK Ok - Only owner can execute. The crowdsale contract will be the owner in this case.
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
    // BK Next 2 Ok
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    // BK Next 2 Ok - Log event
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    // BK Ok
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  // BK Ok - Only owner can execute. The crowdsale contract will be the owner in this case
  function finishMinting() onlyOwner public returns (bool) {
    // BK Ok
    mintingFinished = true;
    // BK Ok - Log event
    MintFinished();
    // BK Ok
    return true;
  }
}

```
