# Sirin Labs Crowdsale Contract Audit

## Summary

[Sirin Labs](https://sirinlabs.com/) intends to run a crowdsale commencing in 13 Dec 2017.

Bok Consulting Pty Ltd was commissioned to perform an audit on the Sirin Labs' crowdsale and token Ethereum smart contract.

This audit has been conducted on Sirin Labs' source code in commits
[cef6e55](https://github.com/sirin-labs/crowdsale-smart-contract/commit/cef6e5535d5460b46e9bd5da9433d6c80c50f3bf) and
[3f6d504](https://github.com/sirin-labs/crowdsale-smart-contract/commit/3f6d504f5ab26d908bd3968bc37749f82894411f).

No potential vulnerabilities have been identified in the crowdsale and token contract.

<br />

### Crowdsale Mainnet Addresses

The crowdsale contract has been deployed to [0x29AfA3443f752eb29d814d9042Fd88A4a2dc0F1e](https://etherscan.io/address/0x29AfA3443f752eb29d814d9042Fd88A4a2dc0F1e#code).

The crowdsale wallet has been deployed to [0x5978c1473ee84Dd9cF3d90D0e931a79906eE52c5](https://etherscan.io/address/0x5978c1473ee84Dd9cF3d90D0e931a79906eE52c5#internaltx).

The *RefundVault* contract has been deployed to [0xa4dDd3977920796BFb14cA8d0FB97491fA72a11d](https://etherscan.io/address/0xa4dDd3977920796BFb14cA8d0FB97491fA72a11d#internaltx).

<br />

### Crowdsale Contract

* Contributors sending ethers (ETH) to the crowdsale / token contract will result in tokens being generated for the sender's account
* Ether contributions without guarantees are sent directly to the crowdsale wallet
* Ether contributions with guarantees are sent to the *RefundVault* contract

<br />

### Token Contract

* The token contract complies to the recently finalised [ERC20 Token Standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md).

* **Note** that the token contract is built to fit into the Bancor smart contracts, and as such have the following functions defined:
  `disableTransfers(...)`, `issue(...)` and `destroy()`. The token contract owner can use these functions to disable the transfer
  of tokens, mint new tokens and burn any account's tokens. These functions are implemented in *LimitedTransferBancorSmartToken*.

<br />

<hr />

## Table Of Contents

* [Summary](#summary)
* [Recommendations](#recommendations)
* [Potential Vulnerabilities](#potential-vulnerabilities)
* [Scope](#scope)
* [Limitations](#limitations)
* [Due Diligence](#due-diligence)
* [Risks](#risks)
* [Testing](#testing)
* [Code Review](#code-review)
  * [contracts/bancor](#contractsbancor)
  * [contracts/crowdsale](#contractscrowdsale)
  * [contracts/math](#contractsmath)
  * [contracts/ownership](#contractsownership)
  * [contracts/token](#contractstoken)
  * [contracts](#contracts)

<br />

<hr />

## Recommendations

* **MEDIUM IMPORTANCE** There is a problem with `RefundVault.claimAllInvestorTokensByOwner(...)` not recording the
  tokens being claimed no behalf of an investor.
  * [x] Resolved by removing this function in [3f6d504](https://github.com/sirin-labs/crowdsale-smart-contract/commit/3f6d504f5ab26d908bd3968bc37749f82894411f)

<br />

<hr />

## Potential Vulnerabilities

No potential vulnerabilities have been identified in the crowdsale and token contract.

<br />

<hr />

## Scope

This audit is into the technical aspects of the crowdsale contracts. The primary aim of this audit is to ensure that funds
contributed to these contracts are not easily attacked or stolen by third parties. The secondary aim of this audit is that
ensure the coded algorithms work as expected. This audit does not guarantee that that the code is bugfree, but intends to
highlight any areas of weaknesses.

<br />

<hr />

## Limitations

This audit makes no statements or warranties about the viability of the Sirin Labs' business proposition, the individuals
involved in this business or the regulatory regime for the business model.

<br />

<hr />

## Due Diligence

As always, potential participants in any crowdsale are encouraged to perform their due diligence on the business proposition
before funding any crowdsales.

Potential participants are also encouraged to only send their funds to the official crowdsale Ethereum address, published on
the crowdsale beneficiary's official communication channel.

Scammers have been publishing phishing address in the forums, twitter and other communication channels, and some go as far as
duplicating crowdsale websites. Potential participants should NOT just click on any links received through these messages.
Scammers have also hacked the crowdsale website to replace the crowdsale contract address with their scam address.
 
Potential participants should also confirm that the verified source code on EtherScan.io for the published crowdsale address
matches the audited source code, and that the deployment parameters are correctly set, including the constant parameters.

<br />

<hr />

## Risks

* ETH contributed to the crowdsale contract sent either to the crowdsale wallet (contributions without guarantees) or to the
  *RefundVault* (contributions with guarantees)
* The *RefundVault* will be a target for hackers, but the attack surface area for this contract is limited 

<br />

<hr />

## Testing

The following functions were tested using the script [test/01_test1.sh](test/01_test1.sh) with the summary results saved
in [test/test1results.txt](test/test1results.txt) and the detailed output saved in [test/test1output.txt](test/test1output.txt):

* [x] Deploy the token contract
* [x] Deploy the *RefundVault* contracts
* [x] Deploy the crowdsale contracts
* [x] Set and link contracts
* [x] Add grantees
* [x] Send contributions
* [x] Finalise crowdsale
* [x] Move tokens using `transfer(...)`, `approve(...)` and `transferFrom(...)`
* [x] Claim refunds from *RefundVault*
* [x] Close *RefundVault*
* [x] Claim tokens from *RefundVault*


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

<br />

The following contract is outside the scope of this review:

* [../contracts/multisig/MultiSigWallet.sol](../contracts/multisig/MultiSigWallet.sol)

<br />

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

<br />

<br />

(c) BokkyPooBah / Bok Consulting Pty Ltd for Sirin Labs - Dec 13 2017. The MIT Licence.