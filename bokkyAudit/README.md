# Sirin Labs Crowdsale Contract Audit

Status: Work in progress

<br />

## Summary

[Sirin Labs](https://sirinlabs.com/)

Commits
[cef6e55](https://github.com/sirin-labs/crowdsale-smart-contract/commit/cef6e5535d5460b46e9bd5da9433d6c80c50f3bf) and
[3f6d504](https://github.com/sirin-labs/crowdsale-smart-contract/commit/3f6d504f5ab26d908bd3968bc37749f82894411f).

### Note

* The token contract is built to fit into the Bancor smart contracts, and as such have the following functions defined:
  `disableTransfers(...)`, `issue(...)` and `destroy()`. The token contract owner can use these functios to disable the transfer
  of tokens, mint new tokens and burn any account's tokens. These functions are implemented in *LimitedTransferBancorSmartToken*

<br />

<hr />

## Table Of Contents

* [Summary](#summary)
* [Recommendations](#recommendations)
* [Testing](#testing)
* [Code Review](#code-review)
  * [contracts/bancor](contractsbancor)
  * [contracts/crowdsale](contractscrowdsale)
  * [contracts/math](contractsmath)
  * [contracts/ownership](contractsownership)
  * [contracts/token](contractstoken)
  * [contracts](contracts)

<br />

<hr />

## Recommendations

* **MEDIUM IMPORTANCE** There is a problem with `RefundVault.claimAllInvestorTokensByOwner(...)` not recording the
  tokens being claimed no behalf of an investor.
  * [x] Resolved by removing this function in [3f6d504](https://github.com/sirin-labs/crowdsale-smart-contract/commit/3f6d504f5ab26d908bd3968bc37749f82894411f)

<br />

<hr />

## Testing

<br />

<hr />

## Code Review

### contracts/math

* [x] [code-review/SafeMath.md](code-review/SafeMath.md)
  * [x] library SafeMath

### contracts/ownership

* [x] [code-review/Ownable.md](code-review/Ownable.md)
  * [x] contract Ownable
* [x] [code-review/Claimable.md](code-review/Claimable.md)
  * [x] contract Claimable is Ownable

### contracts/bancor

* [x] [code-review/ISmartToken.md](code-review/ISmartToken.md)
  * [x] contract ISmartToken
* [x] [code-review/LimitedTransferBancorSmartToken.md](code-review/LimitedTransferBancorSmartToken.md)
  * [x] contract LimitedTransferBancorSmartToken is MintableToken, ISmartToken, LimitedTransferToken

### contracts/crowdsale

* [x] [code-review/Crowdsale.md](code-review/Crowdsale.md)
  * [x] contract Crowdsale
* [x] [code-review/FinalizableCrowdsale.md](code-review/FinalizableCrowdsale.md)
  * [x] contract FinalizableCrowdsale is Crowdsale, Claimable
* [x] [code-review/RefundVault.md](code-review/RefundVault.md)
  * [x] contract RefundVault is Claimable

### contracts/token

* [x] [code-review/ERC20Basic.md](code-review/ERC20Basic.md)
  * [x] contract ERC20Basic
* [x] [code-review/ERC20.md](code-review/ERC20.md)
  * [x] contract ERC20 is ERC20Basic
* [x] [code-review/BasicToken.md](code-review/BasicToken.md)
  * [x] contract BasicToken is ERC20Basic
* [x] [code-review/LimitedTransferToken.md](code-review/LimitedTransferToken.md)
  * [x] contract LimitedTransferToken is ERC20
* [x] [code-review/StandardToken.md](code-review/StandardToken.md)
  * [x] contract StandardToken is ERC20, BasicToken
* [x] [code-review/MintableToken.md](code-review/MintableToken.md)
  * [x] contract MintableToken is StandardToken, Claimable

### contracts

* [ ] [code-review/SirinCrowdsale.md](code-review/SirinCrowdsale.md)
  * [ ] contract SirinCrowdsale is FinalizableCrowdsale
* [x] [code-review/SirinSmartToken.md](code-review/SirinSmartToken.md)
  * [x] contract SirinSmartToken is LimitedTransferBancorSmartToken

The following is outside the scope of this review, but will be checked against existing multisig wallet source code:

* [ ] [code-review/MultiSigWallet.md](code-review/MultiSigWallet.md)
  * [ ] contract MultiSigWallet

The following was not audited as it is part of the testing framework:

* [../contracts/Migrations.sol](../contracts/Migrations.sol)

<br />

### Compiler Warnings

```
Version: 0.4.18+commit.9cf6e910.Darwin.appleclang
token/LimitedTransferToken.sol:54:47: Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.
  function transferableTokens(address holder, uint64 time) public view returns (uint256) {
                                              ^---------^
token/LimitedTransferToken.sol:54:47: Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.
  function transferableTokens(address holder, uint64 time) public view returns (uint256) {
                                              ^---------^
crowdsale/FinalizableCrowdsale.sol:38:3: Warning: Function state mutability can be restricted to pure
  function finalization() internal {
  ^
```