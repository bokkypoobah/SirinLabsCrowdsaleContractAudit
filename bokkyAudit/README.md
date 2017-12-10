# Sirin Labs Crowdsale Contract Audit

Status: Work in progress

<br />

## Summary

[Sirin Labs](https://sirinlabs.com/)

Commits
[cef6e55](https://github.com/sirin-labs/crowdsale-smart-contract/commit/cef6e5535d5460b46e9bd5da9433d6c80c50f3bf).

### Note

* The token contract is built to fit into the Bancor smart contracts, and as such have the following functions defined:
  `disableTransfers(...)`, `issue(...)` and `destroy()`. The token contract owner can theoretically disable the transfer
  of tokens, mint new tokens and burn any account's tokens

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
* [ ] [code-review/LimitedTransferBancorSmartToken.md](code-review/LimitedTransferBancorSmartToken.md)
  * [ ] contract LimitedTransferBancorSmartToken is MintableToken, ISmartToken, LimitedTransferToken

### contracts/crowdsale

* [ ] [code-review/Crowdsale.md](code-review/Crowdsale.md)
  * [ ] contract Crowdsale
* [ ] [code-review/FinalizableCrowdsale.md](code-review/FinalizableCrowdsale.md)
  * [ ] contract FinalizableCrowdsale is Crowdsale, Claimable
* [ ] [code-review/RefundVault.md](code-review/RefundVault.md)
  * [ ] contract RefundVault is Claimable

### contracts/token

* [ ] [code-review/BasicToken.md](code-review/BasicToken.md)
  * [ ] contract BasicToken is ERC20Basic
* [ ] [code-review/ERC20.md](code-review/ERC20.md)
  * [ ] contract ERC20 is ERC20Basic
* [ ] [code-review/ERC20Basic.md](code-review/ERC20Basic.md)
  * [ ] contract ERC20Basic
* [ ] [code-review/LimitedTransferToken.md](code-review/LimitedTransferToken.md)
  * [ ] contract LimitedTransferToken is ERC20
* [ ] [code-review/MintableToken.md](code-review/MintableToken.md)
  * [ ] contract MintableToken is StandardToken, Claimable
* [ ] [code-review/StandardToken.md](code-review/StandardToken.md)
  * [ ] contract StandardToken is ERC20, BasicToken

### contracts

* [ ] [code-review/SirinCrowdsale.md](code-review/SirinCrowdsale.md)
  * [ ] contract SirinCrowdsale is FinalizableCrowdsale
* [ ] [code-review/SirinSmartToken.md](code-review/SirinSmartToken.md)
  * [ ] contract SirinSmartToken is LimitedTransferBancorSmartToken

The following is outside the scope of this review, but will be checked against existing multisig wallet source code:

* [ ] [code-review/MultiSigWallet.md](code-review/MultiSigWallet.md)
  * [ ] contract MultiSigWallet

The following was not audited as it is part of the testing framework:

* [../contracts/Migrations.sol](../contracts/Migrations.sol)
