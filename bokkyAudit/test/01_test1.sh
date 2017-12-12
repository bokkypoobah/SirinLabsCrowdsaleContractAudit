#!/bin/bash
# ----------------------------------------------------------------------------------------------
# Testing the smart contract
#
# Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2017. The MIT Licence.
# ----------------------------------------------------------------------------------------------

MODE=${1:-test}

GETHATTACHPOINT=`grep ^IPCFILE= settings.txt | sed "s/^.*=//"`
PASSWORD=`grep ^PASSWORD= settings.txt | sed "s/^.*=//"`

SOURCEDIR=`grep ^SOURCEDIR= settings.txt | sed "s/^.*=//"`

TOKENSOL=`grep ^TOKENSOL= settings.txt | sed "s/^.*=//"`
TOKENJS=`grep ^TOKENJS= settings.txt | sed "s/^.*=//"`
CROWDSALESOL=`grep ^CROWDSALESOL= settings.txt | sed "s/^.*=//"`
CROWDSALEJS=`grep ^CROWDSALEJS= settings.txt | sed "s/^.*=//"`
REFUNDVAULTSOL=`grep ^REFUNDVAULTSOL= settings.txt | sed "s/^.*=//"`
REFUNDVAULTJS=`grep ^REFUNDVAULTJS= settings.txt | sed "s/^.*=//"`

DEPLOYMENTDATA=`grep ^DEPLOYMENTDATA= settings.txt | sed "s/^.*=//"`

INCLUDEJS=`grep ^INCLUDEJS= settings.txt | sed "s/^.*=//"`
TEST1OUTPUT=`grep ^TEST1OUTPUT= settings.txt | sed "s/^.*=//"`
TEST1RESULTS=`grep ^TEST1RESULTS= settings.txt | sed "s/^.*=//"`

CURRENTTIME=`date +%s`
CURRENTTIMES=`date -r $CURRENTTIME -u`

START_DATE=`echo "$CURRENTTIME+90" | bc`
START_DATE_S=`date -r $START_DATE -u`
END_DATE=`echo "$CURRENTTIME+60*4" | bc`
END_DATE_S=`date -r $END_DATE -u`

printf "MODE               = '$MODE'\n" | tee $TEST1OUTPUT
printf "GETHATTACHPOINT    = '$GETHATTACHPOINT'\n" | tee -a $TEST1OUTPUT
printf "PASSWORD           = '$PASSWORD'\n" | tee -a $TEST1OUTPUT
printf "SOURCEDIR          = '$SOURCEDIR'\n" | tee -a $TEST1OUTPUT
printf "TOKENSOL           = '$TOKENSOL'\n" | tee -a $TEST1OUTPUT
printf "TOKENJS            = '$TOKENJS'\n" | tee -a $TEST1OUTPUT
printf "CROWDSALESOL       = '$CROWDSALESOL'\n" | tee -a $TEST1OUTPUT
printf "CROWDSALEJS        = '$CROWDSALEJS'\n" | tee -a $TEST1OUTPUT
printf "REFUNDVAULTSOL     = '$REFUNDVAULTSOL'\n" | tee -a $TEST1OUTPUT
printf "REFUNDVAULTJS      = '$REFUNDVAULTJS'\n" | tee -a $TEST1OUTPUT
printf "DEPLOYMENTDATA     = '$DEPLOYMENTDATA'\n" | tee -a $TEST1OUTPUT
printf "INCLUDEJS          = '$INCLUDEJS'\n" | tee -a $TEST1OUTPUT
printf "TEST1OUTPUT        = '$TEST1OUTPUT'\n" | tee -a $TEST1OUTPUT
printf "TEST1RESULTS       = '$TEST1RESULTS'\n" | tee -a $TEST1OUTPUT
printf "CURRENTTIME        = '$CURRENTTIME' '$CURRENTTIMES'\n" | tee -a $TEST1OUTPUT
printf "START_DATE         = '$START_DATE' '$START_DATE_S'\n" | tee -a $TEST1OUTPUT
printf "END_DATE           = '$END_DATE' '$END_DATE_S'\n" | tee -a $TEST1OUTPUT

# Make copy of SOL file and modify start and end times ---
# `cp modifiedContracts/SnipCoin.sol .`
`cp -rp $SOURCEDIR/* .`

# --- Modify parameters ---
#`perl -pi -e "s/START_DATE \= 1512921600;.*$/START_DATE \= $START_DATE; \/\/ $START_DATE_S/" $CROWDSALESOL`
`perl -pi -e "s/\.\.\///" crowdsale/$REFUNDVAULTSOL`
`perl -pi -e "s/REFUND_TIME_FRAME \= 60 days/REFUND_TIME_FRAME \= 90 seconds/" crowdsale/$REFUNDVAULTSOL`

DIFFS1=`diff $SOURCEDIR/$TOKENSOL $TOKENSOL`
echo "--- Differences $SOURCEDIR/$TOKENSOL $TOKENSOL ---" | tee -a $TEST1OUTPUT
echo "$DIFFS1" | tee -a $TEST1OUTPUT

DIFFS1=`diff $SOURCEDIR/$CROWDSALESOL $CROWDSALESOL`
echo "--- Differences $SOURCEDIR/$CROWDSALESOL $CROWDSALESOL ---" | tee -a $TEST1OUTPUT
echo "$DIFFS1" | tee -a $TEST1OUTPUT

DIFFS1=`diff $SOURCEDIR/crowdsale/$REFUNDVAULTSOL crowdsale/$REFUNDVAULTSOL`
echo "--- Differences $SOURCEDIR/crowdsale/$REFUNDVAULTSOL crowdsale/$REFUNDVAULTSOL ---" | tee -a $TEST1OUTPUT
echo "$DIFFS1" | tee -a $TEST1OUTPUT

solc_0.4.18 --version | tee -a $TEST1OUTPUT

echo "var tokenOutput=`solc_0.4.18 --optimize --pretty-json --combined-json abi,bin,interface $TOKENSOL`;" > $TOKENJS
echo "var crowdsaleOutput=`solc_0.4.18 --optimize --pretty-json --combined-json abi,bin,interface $CROWDSALESOL`;" > $CROWDSALEJS
echo "var refundVaultOutput=`solc_0.4.18 --allow-paths . --optimize --pretty-json --combined-json abi,bin,interface crowdsale/$REFUNDVAULTSOL`;" > $REFUNDVAULTJS

geth --verbosity 3 attach $GETHATTACHPOINT << EOF | tee -a $TEST1OUTPUT
loadScript("$TOKENJS");
loadScript("$CROWDSALEJS");
loadScript("$REFUNDVAULTJS");
loadScript("functions.js");

var tokenAbi = JSON.parse(tokenOutput.contracts["$TOKENSOL:SirinSmartToken"].abi);
var tokenBin = "0x" + tokenOutput.contracts["$TOKENSOL:SirinSmartToken"].bin;
var crowdsaleAbi = JSON.parse(crowdsaleOutput.contracts["$CROWDSALESOL:SirinCrowdsale"].abi);
var crowdsaleBin = "0x" + crowdsaleOutput.contracts["$CROWDSALESOL:SirinCrowdsale"].bin;
var refundVaultAbi = JSON.parse(refundVaultOutput.contracts["crowdsale/$REFUNDVAULTSOL:RefundVault"].abi);
var refundVaultBin = "0x" + refundVaultOutput.contracts["crowdsale/$REFUNDVAULTSOL:RefundVault"].bin;

// console.log("DATA: tokenAbi=" + JSON.stringify(tokenAbi));
// console.log("DATA: tokenBin=" + JSON.stringify(tokenBin));
// console.log("DATA: crowdsaleAbi=" + JSON.stringify(crowdsaleAbi));
// console.log("DATA: crowdsaleBin=" + JSON.stringify(crowdsaleBin));
// console.log("DATA: refundVaultAbi=" + JSON.stringify(refundVaultAbi));
// console.log("DATA: refundVaultBin=" + JSON.stringify(refundVaultBin));


unlockAccounts("$PASSWORD");
printBalances();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var deployTokenMessage = "Deploy Token";
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + deployTokenMessage + " ---");
var tokenContract = web3.eth.contract(tokenAbi);
// console.log(JSON.stringify(tokenAbi));
var tokenTx = null;
var tokenAddress = null;
var token = tokenContract.new({from: contractOwnerAccount, data: tokenBin, gas: 6000000, gasPrice: defaultGasPrice},
  function(e, contract) {
    if (!e) {
      if (!contract.address) {
        tokenTx = contract.transactionHash;
      } else {
        tokenAddress = contract.address;
        addAccount(tokenAddress, "Token '" + token.symbol() + "' '" + token.name() + "'");
        addTokenContractAddressAndAbi(tokenAddress, tokenAbi);
        console.log("DATA: tokenAddress=" + tokenAddress);
      }
    }
  }
);
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(tokenTx, deployTokenMessage);
printTxData("tokenTx", tokenTx);
printTokenContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var deployRefundVaultMessage = "Deploy RefundVault";
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + deployRefundVaultMessage + " ---");
var refundVaultContract = web3.eth.contract(refundVaultAbi);
// console.log(JSON.stringify(refundVaultAbi));
var refundVaultTx = null;
var refundVaultAddress = null;
var refundVault = refundVaultContract.new(wallet, tokenAddress, {from: contractOwnerAccount, data: refundVaultBin, gas: 6000000, gasPrice: defaultGasPrice},
  function(e, contract) {
    if (!e) {
      if (!contract.address) {
        refundVaultTx = contract.transactionHash;
      } else {
        refundVaultAddress = contract.address;
        addAccount(refundVaultAddress, "RefundVault");
        addRefundVaultContractAddressAndAbi(refundVaultAddress, refundVaultAbi);
        console.log("DATA: refundVaultAddress=" + refundVaultAddress);
      }
    }
  }
);
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(refundVaultTx, deployRefundVaultMessage);
printTxData("refundVaultTx", refundVaultTx);
printRefundVaultContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var crowdsaleMessage = "Deploy Crowdsale Contract";
var startTime = $START_DATE;
var endTime = $END_DATE;
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + crowdsaleMessage + " ---");
var crowdsaleContract = web3.eth.contract(crowdsaleAbi);
// console.log(JSON.stringify(crowdsaleContract));
var crowdsaleTx = null;
var crowdsaleAddress = null;
var crowdsale = crowdsaleContract.new(startTime, endTime, wallet, teamWallet, oemWallet, bountiesWallet, reserveWallet, tokenAddress, refundVaultAddress, {from: contractOwnerAccount, data: crowdsaleBin, gas: 6000000, gasPrice: defaultGasPrice},
  function(e, contract) {
    if (!e) {
      if (!contract.address) {
        crowdsaleTx = contract.transactionHash;
      } else {
        crowdsaleAddress = contract.address;
        addAccount(crowdsaleAddress, "Crowdsale");
        addCrowdsaleContractAddressAndAbi(crowdsaleAddress, crowdsaleAbi);
        console.log("DATA: crowdsaleAddress=" + crowdsaleAddress);
      }
    }
  }
);
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(crowdsaleTx, crowdsaleMessage);
printTxData("crowdsaleAddress=" + crowdsaleAddress, crowdsaleTx);
printCrowdsaleContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var setup_Message = "Setup";
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + setup_Message + " ---");
var setup_1Tx = token.transferOwnership(crowdsaleAddress, {from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
var setup_2Tx = refundVault.transferOwnership(crowdsaleAddress, {from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
var setup_3Tx = crowdsale.claimTokenOwnership({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
var setup_4Tx = crowdsale.claimRefundVaultOwnership({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(setup_1Tx, setup_Message + " - token.transferOwnership(crowdsaleAddress)");
failIfTxStatusError(setup_2Tx, setup_Message + " - refundVault.transferOwnership(crowdsaleAddress)");
failIfTxStatusError(setup_3Tx, setup_Message + " - crowdsale.claimTokenOwnership()");
failIfTxStatusError(setup_4Tx, setup_Message + " - crowdsale.claimRefundVaultOwnership()");
printTxData("setup_1Tx", setup_1Tx);
printTxData("setup_2Tx", setup_2Tx);
printTxData("setup_3Tx", setup_3Tx);
printTxData("setup_4Tx", setup_4Tx);
printCrowdsaleContractDetails();
printRefundVaultContractDetails();
printTokenContractDetails();
console.log("RESULT: ");


waitUntil("START_DATE", $START_DATE, 0);


// -----------------------------------------------------------------------------
var sendContribution1Message = "Send Contribution #1";
// -----------------------------------------------------------------------------
console.log("RESULT: " + sendContribution1Message);
var sendContribution1_1Tx = eth.sendTransaction({from: account3, to: crowdsaleAddress, value: web3.toWei("10", "ether"), gas: 400000, gasPrice: defaultGasPrice});
var sendContribution1_2Tx = eth.sendTransaction({from: account4, to: crowdsaleAddress, value: web3.toWei("10", "ether"), gas: 400000, gasPrice: defaultGasPrice});
var sendContribution1_3Tx = crowdsale.buyTokensWithGuarantee({from: account5, value: web3.toWei("10", "ether"), gas: 400000, gasPrice: defaultGasPrice});
var sendContribution1_4Tx = crowdsale.buyTokensWithGuarantee({from: account6, value: web3.toWei("10", "ether"), gas: 400000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(sendContribution1_1Tx, sendContribution1Message + " - ac3 10 ETH");
failIfTxStatusError(sendContribution1_2Tx, sendContribution1Message + " - ac4 10 ETH");
failIfTxStatusError(sendContribution1_3Tx, sendContribution1Message + " - ac5 buyTokensWithGuarantee 10 ETH");
failIfTxStatusError(sendContribution1_4Tx, sendContribution1Message + " - ac6 buyTokensWithGuarantee 10 ETH");
printTxData("sendContribution1_1Tx", sendContribution1_1Tx);
printTxData("sendContribution1_2Tx", sendContribution1_2Tx);
printTxData("sendContribution1_3Tx", sendContribution1_3Tx);
printTxData("sendContribution1_4Tx", sendContribution1_4Tx);
printCrowdsaleContractDetails();
printTokenContractDetails();
printRefundVaultContractDetails();
console.log("RESULT: ");


waitUntil("END_DATE", $END_DATE, 0);


// -----------------------------------------------------------------------------
var finalise_Message = "Finalise Crowdsale";
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + finalise_Message + " ---");
var finalise_1Tx = crowdsale.finalize({from: contractOwnerAccount, gas: 1000000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
var finalise_2Tx = token.claimOwnership({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
var finalise_3Tx = refundVault.claimOwnership({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
var finalise_4Tx = refundVault.enableRefunds({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(finalise_1Tx, finalise_Message + " - crowdsale.finalize()");
failIfTxStatusError(finalise_2Tx, finalise_Message + " - token.claimOwnership()");
failIfTxStatusError(finalise_3Tx, finalise_Message + " - refundVault.claimOwnership()");
failIfTxStatusError(finalise_4Tx, finalise_Message + " - refundVault.enableRefunds()");
printTxData("finalise_1Tx", finalise_1Tx);
printTxData("finalise_2Tx", finalise_2Tx);
printTxData("finalise_3Tx", finalise_3Tx);
printTxData("finalise_4Tx", finalise_4Tx);
printCrowdsaleContractDetails();
printTokenContractDetails();
printRefundVaultContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var moveTokenMessage = "Move Tokens After Transfers Allowed";
// -----------------------------------------------------------------------------
console.log("RESULT: -- " + moveTokenMessage + " ---");
var moveToken1Tx = token.transfer(account7, "100000000000000000000", {from: account3, gas: 100000, gasPrice: defaultGasPrice});
var moveToken2Tx = token.approve(account8,  "30000000000000000000", {from: account4, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
var moveToken3Tx = token.transferFrom(account4, account9, "30000000000000000000", {from: account8, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(moveToken1Tx, moveTokenMessage + " - transfer 100 token ac3 -> ac7. CHECK for movement");
failIfTxStatusError(moveToken2Tx, moveTokenMessage + " - approve 30 tokens ac4 -> ac8");
failIfTxStatusError(moveToken3Tx, moveTokenMessage + " - transferFrom 30 tokens ac4 -> ac9 by ac8. CHECK for movement");
printTxData("moveToken1Tx", moveToken1Tx);
printTxData("moveToken2Tx", moveToken2Tx);
printTxData("moveToken3Tx", moveToken3Tx);
printTokenContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var claimRefundMessage = "Claim Refund";
// -----------------------------------------------------------------------------
console.log("RESULT: -- " + claimRefundMessage + " ---");
var claimRefund1Tx = refundVault.refundETH("1000000000000000000", {from: account5, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(claimRefund1Tx, claimRefundMessage + " - ac5 refundVault.refundETH(1 eth)");
printTxData("claimRefund1Tx", claimRefund1Tx);
printTokenContractDetails();
printRefundVaultContractDetails();
console.log("RESULT: ");


waitUntil("refundStartTime + 90 + 5 seconds", refundVault.refundStartTime(), 95);


// -----------------------------------------------------------------------------
var closeRefundVault_Message = "Close RefundVault";
// -----------------------------------------------------------------------------
console.log("RESULT: --- " + closeRefundVault_Message + " ---");
var closeRefundVault_1Tx = refundVault.close({from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(closeRefundVault_1Tx, closeRefundVault_Message + " - refundVault.close()");
printTxData("closeRefundVault_1Tx", closeRefundVault_1Tx);
printRefundVaultContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var claimTokens1Message = "Claim Tokens #1";
// -----------------------------------------------------------------------------
console.log("RESULT: -- " + claimTokens1Message + " ---");
var claimTokens1_1Tx = refundVault.claimAllInvestorTokensByOwner(account6, {from: contractOwnerAccount, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
failIfTxStatusError(claimTokens1_1Tx, claimTokens1Message + " - refundVault.claimAllInvestorTokensByOwner(account6)");
printTxData("claimTokens1_1Tx", claimTokens1_1Tx);
printTokenContractDetails();
printRefundVaultContractDetails();
console.log("RESULT: ");


// -----------------------------------------------------------------------------
var claimTokens2Message = "Claim Tokens #2";
// -----------------------------------------------------------------------------
console.log("RESULT: -- " + claimTokens2Message + " ---");
var claimTokens2_1Tx = refundVault.claimAllTokens({from: account6, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
var claimTokens2_2Tx = refundVault.claimAllTokens({from: account5, gas: 100000, gasPrice: defaultGasPrice});
while (txpool.status.pending > 0) {
}
printBalances();
passIfTxStatusError(claimTokens2_1Tx, claimTokens2Message + " - refundVault.claimAllTokens() by ac6 - Expecting to fail as owner claimed");
failIfTxStatusError(claimTokens2_2Tx, claimTokens2Message + " - refundVault.claimAllTokens() by ac5");
printTxData("claimTokens2_1Tx", claimTokens2_1Tx);
printTxData("claimTokens2_2Tx", claimTokens2_2Tx);
printTokenContractDetails();
printRefundVaultContractDetails();
console.log("RESULT: ");


EOF
grep "DATA: " $TEST1OUTPUT | sed "s/DATA: //" > $DEPLOYMENTDATA
cat $DEPLOYMENTDATA
grep "RESULT: " $TEST1OUTPUT | sed "s/RESULT: //" > $TEST1RESULTS
cat $TEST1RESULTS
