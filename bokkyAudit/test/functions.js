// 11 Dec 2017 11:39 AEST => 447.07 from CMC
var ethPriceUSD = 447.07;
var defaultGasPrice = web3.toWei(11, "gwei");

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------
var accounts = [];
var accountNames = {};

addAccount(eth.accounts[0], "Account #0 - Miner");
addAccount(eth.accounts[1], "Account #1 - Contract Owner");
addAccount(eth.accounts[2], "Account #2");
addAccount(eth.accounts[3], "Account #3");
addAccount(eth.accounts[4], "Account #4");
addAccount(eth.accounts[5], "Account #5");
addAccount(eth.accounts[6], "Account #6");
addAccount(eth.accounts[7], "Account #7");
addAccount(eth.accounts[8], "Account #8");
addAccount(eth.accounts[9], "Account #9");
addAccount(eth.accounts[10], "Account #10 - Crowdsale Wallet");
addAccount(eth.accounts[11], "Account #11 - Team Wallet");
addAccount(eth.accounts[12], "Account #12 - OEM Wallet");
addAccount(eth.accounts[13], "Account #13 - Bounties Wallet");
addAccount(eth.accounts[14], "Account #14 - Reserve Wallet");

var minerAccount = eth.accounts[0];
var contractOwnerAccount = eth.accounts[1];
var account2 = eth.accounts[2];
var account3 = eth.accounts[3];
var account4 = eth.accounts[4];
var account5 = eth.accounts[5];
var account6 = eth.accounts[6];
var account7 = eth.accounts[7];
var account8 = eth.accounts[8];
var account9 = eth.accounts[9];
var wallet = eth.accounts[10];
var teamWallet = eth.accounts[11];
var oemWallet = eth.accounts[12];
var bountiesWallet = eth.accounts[13];
var reserveWallet = eth.accounts[14];

var baseBlock = eth.blockNumber;

function unlockAccounts(password) {
  for (var i = 0; i < eth.accounts.length && i < accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], password, 100000);
  }
}

function addAccount(account, accountName) {
  accounts.push(account);
  accountNames[account] = accountName;
}


// -----------------------------------------------------------------------------
// Token Contract
// -----------------------------------------------------------------------------
var tokenContractAddress = null;
var tokenContractAbi = null;

function addTokenContractAddressAndAbi(address, tokenAbi) {
  tokenContractAddress = address;
  tokenContractAbi = tokenAbi;
}


// -----------------------------------------------------------------------------
// Account ETH and token balances
// -----------------------------------------------------------------------------
function printBalances() {
  var token = tokenContractAddress == null || tokenContractAbi == null ? null : web3.eth.contract(tokenContractAbi).at(tokenContractAddress);
  var decimals = token == null ? 18 : token.decimals();
  var i = 0;
  var totalTokenBalance = new BigNumber(0);
  console.log("RESULT:  # Account                                             EtherBalanceChange                          Token Name");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  accounts.forEach(function(e) {
    var etherBalanceBaseBlock = eth.getBalance(e, baseBlock);
    var etherBalance = web3.fromWei(eth.getBalance(e).minus(etherBalanceBaseBlock), "ether");
    var tokenBalance = token == null ? new BigNumber(0) : token.balanceOf(e).shift(-decimals);
    totalTokenBalance = totalTokenBalance.add(tokenBalance);
    console.log("RESULT: " + pad2(i) + " " + e  + " " + pad(etherBalance) + " " + padToken(tokenBalance, decimals) + " " + accountNames[e]);
    i++;
  });
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT:                                                                           " + padToken(totalTokenBalance, decimals) + " Total Token Balances");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT: ");
}

function pad2(s) {
  var o = s.toFixed(0);
  while (o.length < 2) {
    o = " " + o;
  }
  return o;
}

function pad(s) {
  var o = s.toFixed(18);
  while (o.length < 27) {
    o = " " + o;
  }
  return o;
}

function padToken(s, decimals) {
  var o = s.toFixed(decimals);
  var l = parseInt(decimals)+12;
  while (o.length < l) {
    o = " " + o;
  }
  return o;
}


// -----------------------------------------------------------------------------
// Transaction status
// -----------------------------------------------------------------------------
function printTxData(name, txId) {
  var tx = eth.getTransaction(txId);
  var txReceipt = eth.getTransactionReceipt(txId);
  var gasPrice = tx.gasPrice;
  var gasCostETH = tx.gasPrice.mul(txReceipt.gasUsed).div(1e18);
  var gasCostUSD = gasCostETH.mul(ethPriceUSD);
  var block = eth.getBlock(txReceipt.blockNumber);
  console.log("RESULT: " + name + " status=" + txReceipt.status + (txReceipt.status == 0 ? " Failure" : " Success") + " gas=" + tx.gas +
    " gasUsed=" + txReceipt.gasUsed + " costETH=" + gasCostETH + " costUSD=" + gasCostUSD +
    " @ ETH/USD=" + ethPriceUSD + " gasPrice=" + web3.fromWei(gasPrice, "gwei") + " gwei block=" + 
    txReceipt.blockNumber + " txIx=" + tx.transactionIndex + " txId=" + txId +
    " @ " + block.timestamp + " " + new Date(block.timestamp * 1000).toUTCString());
}

function assertEtherBalance(account, expectedBalance) {
  var etherBalance = web3.fromWei(eth.getBalance(account), "ether");
  if (etherBalance == expectedBalance) {
    console.log("RESULT: OK " + account + " has expected balance " + expectedBalance);
  } else {
    console.log("RESULT: FAILURE " + account + " has balance " + etherBalance + " <> expected " + expectedBalance);
  }
}

function failIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 0) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 1) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function gasEqualsGasUsed(tx) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  return (gas == gasUsed);
}

function failIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: PASS " + msg);
    return 1;
  } else {
    console.log("RESULT: FAIL " + msg);
    return 0;
  }
}

function failIfGasEqualsGasUsedOrContractAddressNull(contractAddress, tx, msg) {
  if (contractAddress == null) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    var gas = eth.getTransaction(tx).gas;
    var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
    if (gas == gasUsed) {
      console.log("RESULT: FAIL " + msg);
      return 0;
    } else {
      console.log("RESULT: PASS " + msg);
      return 1;
    }
  }
}


//-----------------------------------------------------------------------------
//Wait until some unixTime + additional seconds
//-----------------------------------------------------------------------------
function waitUntil(message, unixTime, addSeconds) {
  var t = parseInt(unixTime) + parseInt(addSeconds) + parseInt(1);
  var time = new Date(t * 1000);
  console.log("RESULT: Waiting until '" + message + "' at " + unixTime + "+" + addSeconds + "s=" + time + " now=" + new Date());
  while ((new Date()).getTime() <= time.getTime()) {
  }
  console.log("RESULT: Waited until '" + message + "' at at " + unixTime + "+" + addSeconds + "s=" + time + " now=" + new Date());
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
//Wait until some block
//-----------------------------------------------------------------------------
function waitUntilBlock(message, block, addBlocks) {
  var b = parseInt(block) + parseInt(addBlocks);
  console.log("RESULT: Waiting until '" + message + "' #" + block + "+" + addBlocks + "=#" + b + " currentBlock=" + eth.blockNumber);
  while (eth.blockNumber <= b) {
  }
  console.log("RESULT: Waited until '" + message + "' #" + block + "+" + addBlocks + "=#" + b + " currentBlock=" + eth.blockNumber);
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// Token Contract
//-----------------------------------------------------------------------------
var tokenFromBlock = 0;
function printTokenContractDetails() {
  console.log("RESULT: tokenContractAddress=" + tokenContractAddress);
  if (tokenContractAddress != null && tokenContractAbi != null) {
    var contract = eth.contract(tokenContractAbi).at(tokenContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.owner=" + contract.owner());
    console.log("RESULT: token.pendingOwner=" + contract.pendingOwner());
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.totalSupply=" + contract.totalSupply().shift(-decimals));
    console.log("RESULT: token.destroyEnabled=" + contract.destroyEnabled());
    console.log("RESULT: token.mintingFinished=" + contract.mintingFinished());
    console.log("RESULT: token.transfersEnabled=" + contract.transfersEnabled());

    var latestBlock = eth.blockNumber;
    var i;

    var ownershipTransferredEvents = contract.OwnershipTransferred({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    ownershipTransferredEvents.watch(function (error, result) {
      console.log("RESULT: OwnershipTransferred " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    ownershipTransferredEvents.stopWatching();

    var mintEvents = contract.Mint({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    mintEvents.watch(function (error, result) {
      console.log("RESULT: Mint " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    mintEvents.stopWatching();

    var mintFinishedEvents = contract.MintFinished({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    mintFinishedEvents.watch(function (error, result) {
      console.log("RESULT: MintFinished " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    mintFinishedEvents.stopWatching();

    var newSmartTokenEvents = contract.NewSmartToken({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    newSmartTokenEvents.watch(function (error, result) {
      console.log("RESULT: NewSmartToken " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    newSmartTokenEvents.stopWatching();

    var issuanceEvents = contract.Issuance({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    issuanceEvents.watch(function (error, result) {
      console.log("RESULT: Issuance " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    issuanceEvents.stopWatching();

    var destructionEvents = contract.Destruction({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    destructionEvents.watch(function (error, result) {
      console.log("RESULT: Destruction " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    destructionEvents.stopWatching();

    var approvalEvents = contract.Approval({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: Approval " + i++ + " #" + result.blockNumber + " owner=" + result.args.owner +
        " spender=" + result.args.spender + " value=" + result.args.value.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: Transfer " + i++ + " #" + result.blockNumber + ": from=" + result.args.from + " to=" + result.args.to +
        " value=" + result.args.value.shift(-decimals));
    });
    transferEvents.stopWatching();

    tokenFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// Crowdsale Contract
// -----------------------------------------------------------------------------
var crowdsaleContractAddress = null;
var crowdsaleContractAbi = null;

function addCrowdsaleContractAddressAndAbi(address, crowdsaleAbi) {
  crowdsaleContractAddress = address;
  crowdsaleContractAbi = crowdsaleAbi;
}

var crowdsaleFromBlock = 0;
function printCrowdsaleContractDetails() {
  console.log("RESULT: crowdsaleContractAddress=" + crowdsaleContractAddress);
  if (crowdsaleContractAddress != null && crowdsaleContractAbi != null) {
    var contract = eth.contract(crowdsaleContractAbi).at(crowdsaleContractAddress);
    console.log("RESULT: crowdsale.owner=" + contract.owner());
    console.log("RESULT: crowdsale.pendingOwner=" + contract.pendingOwner());
    console.log("RESULT: crowdsale.isFinalized=" + contract.isFinalized());
    console.log("RESULT: crowdsale.token=" + contract.token());
    console.log("RESULT: crowdsale.startTime=" + contract.startTime() + " " + new Date(contract.startTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.endTime=" + contract.endTime() + " " + new Date(contract.endTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.wallet=" + contract.wallet());
    console.log("RESULT: crowdsale.rate=" + contract.rate());
    console.log("RESULT: crowdsale.weiRaised=" + contract.weiRaised() + " " + contract.weiRaised().shift(-18) + " ETH");
    console.log("RESULT: crowdsale.MAX_TOKEN_GRANTEES=" + contract.MAX_TOKEN_GRANTEES());
    console.log("RESULT: crowdsale.EXCHANGE_RATE=" + contract.EXCHANGE_RATE());
    console.log("RESULT: crowdsale.REFUND_DIVISION_RATE=" + contract.REFUND_DIVISION_RATE());
    console.log("RESULT: crowdsale.walletTeam=" + contract.walletTeam());
    console.log("RESULT: crowdsale.walletOEM=" + contract.walletOEM());
    console.log("RESULT: crowdsale.walletBounties=" + contract.walletBounties());
    console.log("RESULT: crowdsale.walletReserve=" + contract.walletReserve());
    console.log("RESULT: crowdsale.fiatRaisedConvertedToWei=" + contract.fiatRaisedConvertedToWei());
    console.log("RESULT: crowdsale.refundVault=" + contract.refundVault());

    var latestBlock = eth.blockNumber;
    var i;

    var ownershipTransferredEvents = contract.OwnershipTransferred({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    ownershipTransferredEvents.watch(function (error, result) {
      console.log("RESULT: OwnershipTransferred " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    ownershipTransferredEvents.stopWatching();

    var finalizedEvents = contract.Finalized({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    finalizedEvents.watch(function (error, result) {
      console.log("RESULT: Finalized " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    finalizedEvents.stopWatching();

    var tokenPurchaseEvents = contract.TokenPurchase({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    tokenPurchaseEvents.watch(function (error, result) {
      console.log("RESULT: TokenPurchase " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    tokenPurchaseEvents.stopWatching();

    var grantAddedEvents = contract.GrantAdded({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    grantAddedEvents.watch(function (error, result) {
      console.log("RESULT: GrantAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    grantAddedEvents.stopWatching();

    var grantUpdatedEvents = contract.GrantUpdated({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    grantUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: GrantUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    grantUpdatedEvents.stopWatching();

    var grantDeletedEvents = contract.GrantDeleted({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    grantDeletedEvents.watch(function (error, result) {
      console.log("RESULT: GrantDeleted " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    grantDeletedEvents.stopWatching();

    var fiatRaisedUpdatedEvents = contract.FiatRaisedUpdated({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    fiatRaisedUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: FiatRaisedUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    fiatRaisedUpdatedEvents.stopWatching();

    var tokenPurchaseWithGuaranteeEvents = contract.TokenPurchaseWithGuarantee({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    tokenPurchaseWithGuaranteeEvents.watch(function (error, result) {
      console.log("RESULT: TokenPurchaseWithGuarantee " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    tokenPurchaseWithGuaranteeEvents.stopWatching();

    crowdsaleFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// TokenFactory Contract
// -----------------------------------------------------------------------------
var tokenFactoryContractAddress = null;
var tokenFactoryContractAbi = null;

function addTokenFactoryContractAddressAndAbi(address, tokenFactoryAbi) {
  tokenFactoryContractAddress = address;
  tokenFactoryContractAbi = tokenFactoryAbi;
}

var tokenFactoryFromBlock = 0;

function getBTTSFactoryTokenListing() {
  var addresses = [];
  console.log("RESULT: tokenFactoryContractAddress=" + tokenFactoryContractAddress);
  if (tokenFactoryContractAddress != null && tokenFactoryContractAbi != null) {
    var contract = eth.contract(tokenFactoryContractAbi).at(tokenFactoryContractAddress);

    var latestBlock = eth.blockNumber;
    var i;

    var bttsTokenListingEvents = contract.BTTSTokenListing({}, { fromBlock: tokenFactoryFromBlock, toBlock: latestBlock });
    i = 0;
    bttsTokenListingEvents.watch(function (error, result) {
      console.log("RESULT: get BTTSTokenListing " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
      addresses.push(result.args.bttsTokenAddress);
    });
    bttsTokenListingEvents.stopWatching();
  }
  return addresses;
}

function printTokenFactoryContractDetails() {
  console.log("RESULT: tokenFactoryContractAddress=" + tokenFactoryContractAddress);
  if (tokenFactoryContractAddress != null && tokenFactoryContractAbi != null) {
    var contract = eth.contract(tokenFactoryContractAbi).at(tokenFactoryContractAddress);
    console.log("RESULT: tokenFactory.owner=" + contract.owner());
    console.log("RESULT: tokenFactory.newOwner=" + contract.newOwner());

    var latestBlock = eth.blockNumber;
    var i;

    var ownershipTransferredEvents = contract.OwnershipTransferred({}, { fromBlock: tokenFactoryFromBlock, toBlock: latestBlock });
    i = 0;
    ownershipTransferredEvents.watch(function (error, result) {
      console.log("RESULT: OwnershipTransferred " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    ownershipTransferredEvents.stopWatching();

    var bttsTokenListingEvents = contract.BTTSTokenListing({}, { fromBlock: tokenFactoryFromBlock, toBlock: latestBlock });
    i = 0;
    bttsTokenListingEvents.watch(function (error, result) {
      console.log("RESULT: BTTSTokenListing " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    bttsTokenListingEvents.stopWatching();

    tokenFactoryFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// BonusList Contract
// -----------------------------------------------------------------------------
var bonusListContractAddress = null;
var bonusListContractAbi = null;

function addBonusListContractAddressAndAbi(address, bonusListAbi) {
  bonusListContractAddress = address;
  bonusListContractAbi = bonusListAbi;
}

var bonusListFromBlock = 0;
function printBonusListContractDetails() {
  console.log("RESULT: bonusListContractAddress=" + bonusListContractAddress);
  if (bonusListContractAddress != null && bonusListContractAbi != null) {
    var contract = eth.contract(bonusListContractAbi).at(bonusListContractAddress);
    console.log("RESULT: bonusList.owner=" + contract.owner());
    console.log("RESULT: bonusList.newOwner=" + contract.newOwner());
    console.log("RESULT: bonusList.sealed=" + contract.sealed());

    var latestBlock = eth.blockNumber;
    var i;

    var ownershipTransferredEvents = contract.OwnershipTransferred({}, { fromBlock: bonusListFromBlock, toBlock: latestBlock });
    i = 0;
    ownershipTransferredEvents.watch(function (error, result) {
      console.log("RESULT: OwnershipTransferred " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    ownershipTransferredEvents.stopWatching();

    var adminAddedEvents = contract.AdminAdded({}, { fromBlock: bonusListFromBlock, toBlock: latestBlock });
    i = 0;
    adminAddedEvents.watch(function (error, result) {
      console.log("RESULT: AdminAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    adminAddedEvents.stopWatching();

    var adminRemovedEvents = contract.AdminRemoved({}, { fromBlock: bonusListFromBlock, toBlock: latestBlock });
    i = 0;
    adminRemovedEvents.watch(function (error, result) {
      console.log("RESULT: AdminRemoved " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    adminRemovedEvents.stopWatching();

    var addressListedEvents = contract.AddressListed({}, { fromBlock: bonusListFromBlock, toBlock: latestBlock });
    i = 0;
    addressListedEvents.watch(function (error, result) {
      console.log("RESULT: AddressListed " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    addressListedEvents.stopWatching();

    bonusListFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// Generate Summary JSON
// -----------------------------------------------------------------------------
function generateSummaryJSON() {
  console.log("JSONSUMMARY: {");
  if (crowdsaleContractAddress != null && crowdsaleContractAbi != null) {
    var contract = eth.contract(crowdsaleContractAbi).at(crowdsaleContractAddress);
    var blockNumber = eth.blockNumber;
    var timestamp = eth.getBlock(blockNumber).timestamp;
    console.log("JSONSUMMARY:   \"blockNumber\": " + blockNumber + ",");
    console.log("JSONSUMMARY:   \"blockTimestamp\": " + timestamp + ",");
    console.log("JSONSUMMARY:   \"blockTimestampString\": \"" + new Date(timestamp * 1000).toUTCString() + "\",");
    console.log("JSONSUMMARY:   \"crowdsaleContractAddress\": \"" + crowdsaleContractAddress + "\",");
    console.log("JSONSUMMARY:   \"crowdsaleContractOwnerAddress\": \"" + contract.owner() + "\",");
    console.log("JSONSUMMARY:   \"tokenContractAddress\": \"" + contract.bttsToken() + "\",");
    console.log("JSONSUMMARY:   \"tokenContractDecimals\": " + contract.TOKEN_DECIMALS() + ",");
    console.log("JSONSUMMARY:   \"crowdsaleWalletAddress\": \"" + contract.wallet() + "\",");
    console.log("JSONSUMMARY:   \"crowdsaleTeamWalletAddress\": \"" + contract.teamWallet() + "\",");
    console.log("JSONSUMMARY:   \"crowdsaleTeamPercent\": " + contract.TEAM_PERCENT_GZE() + ",");
    console.log("JSONSUMMARY:   \"bonusListContractAddress\": \"" + contract.bonusList() + "\",");
    console.log("JSONSUMMARY:   \"tier1Bonus\": " + contract.TIER1_BONUS() + ",");
    console.log("JSONSUMMARY:   \"tier2Bonus\": " + contract.TIER2_BONUS() + ",");
    console.log("JSONSUMMARY:   \"tier3Bonus\": " + contract.TIER3_BONUS() + ",");
    var startDate = contract.START_DATE();
    // BK TODO - Remove for production
    startDate = 1512921600;
    var endDate = contract.endDate();
    // BK TODO - Remove for production
    endDate = 1513872000;
    console.log("JSONSUMMARY:   \"crowdsaleStart\": " + startDate + ",");
    console.log("JSONSUMMARY:   \"crowdsaleStartString\": \"" + new Date(startDate * 1000).toUTCString() + "\",");
    console.log("JSONSUMMARY:   \"crowdsaleEnd\": " + endDate + ",");
    console.log("JSONSUMMARY:   \"crowdsaleEndString\": \"" + new Date(endDate * 1000).toUTCString() + "\",");
    console.log("JSONSUMMARY:   \"usdPerEther\": " + contract.usdPerKEther().shift(-3) + ",");
    console.log("JSONSUMMARY:   \"usdPerGze\": " + contract.USD_CENT_PER_GZE().shift(-2) + ",");
    console.log("JSONSUMMARY:   \"gzePerEth\": " + contract.gzePerEth().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"capInUsd\": " + contract.CAP_USD() + ",");
    console.log("JSONSUMMARY:   \"capInEth\": " + contract.capEth().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"minimumContributionEth\": " + contract.MIN_CONTRIBUTION_ETH().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"contributedEth\": " + contract.contributedEth().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"contributedUsd\": " + contract.contributedUsd() + ",");
    console.log("JSONSUMMARY:   \"generatedGze\": " + contract.generatedGze().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"lockedAccountThresholdUsd\": " + contract.lockedAccountThresholdUsd() + ",");
    console.log("JSONSUMMARY:   \"lockedAccountThresholdEth\": " + contract.lockedAccountThresholdEth().shift(-18) + ",");
    console.log("JSONSUMMARY:   \"precommitmentAdjusted\": " + contract.precommitmentAdjusted() + ",");
    console.log("JSONSUMMARY:   \"finalised\": " + contract.finalised());
  }
  console.log("JSONSUMMARY: }");
}