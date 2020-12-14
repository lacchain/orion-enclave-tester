const helper = {}
const readline = require('readline');
//const {sendTransaction} = require('../pantheon_utils/web3Operations')
const {append} = require('./logs')
const {STORE_DATA} =require('../keys')
const {storeValueFromNode1,verifyTx} = require("../example/multiNodeExamplePrivacyGroup/storeValueFromNode1")
let count = 0
let failed = 0
let failedForNotDelivered = 0

helper.reproduce = (times,data) => {
    let customData = ""    
    for(let i = 0; i<times; i++){
        customData = customData + data        
    }
    return customData
}

helper.verify = (outgoing,incoming) =>{
    const match = outgoing === incoming
    if(match){
        console.log("Outgoing and stored data matches")
    }else{
        console.log("Data do not match")
    }
}

helper.askQuestion = async(query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    }); 

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

helper.createRandomString = (strLength) =>{
    strLength = typeof(strLength) === 'number' && strLength >0 ? strLength :false
    if(strLength){
        //Define  all the possible characters that could  go into a string
        const possibleCharacters = 'abcdef0123456789'

        //Start the final string
        let str = ''

        for(let i =1; i<= strLength; i++){
            //Get the random charachter from the possibleCharacters string
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*
            possibleCharacters.length))
            //Append this character to the final string
            str += randomCharacter
        }
        return str
    }else{
        return false
    }
}

helper.generateKeys = i => {
    const privateKeys = []
    for(k=1;k<=i;k++){
      let randomHexKey = helper.createRandomString(64)
      const bufferRandomKey = Buffer.from(randomHexKey,'hex')    
      privateKeys.push(bufferRandomKey)
    }
    //console.log(privateKeys)
    return privateKeys
}

helper.generateKey = () => {
    return helper.createRandomString(64)
}

helper.verifyDesiredRate = (desiredRateTx) => {
    desiredRateTx = parseInt(desiredRateTx)
    if(desiredRateTx && desiredRateTx>0 && isFinite(desiredRateTx) ){
        return desiredRateTx //achieves the desired tx rate per second
    }else {
        console.log("invalid rate transaction")
        process.exit()
    }
}

helper.verifyTestime = testTime => {
    testTime = parseFloat(testTime)
    if(testTime && testTime>0 && isFinite(testTime)) {
        return testTime
    }

    console.log("invalid testTime")
    process.exit()
}

helper.verifyAmountData = amountData => {
    amountData =  parseInt(amountData)
    if(amountData>=0 && isFinite(amountData)){
        return amountData
    }

    console.log("invalid data to add on each transaction")
    process.exit()
}

helper.verifyNumberOfContainers  = numerOfContainers => {
    numerOfContainers = parseInt(numerOfContainers)
    if(numerOfContainers>0 && isFinite(numerOfContainers)){
        return numerOfContainers
    }

    console.log("invalid specified number of containers")
    process.exit()
}

helper.sendTransactionAndProcessIncommingTx = async (txObject,privKey,t1,fileNameResponse,numberOfTransactions) => {
    let txTimeResponse
    try{
        await sendTransaction(txObject,privKey)
        txTimeResponse = (Date.now() - t1)
        if(STORE_DATA=="TRUE"){
        append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count+1).toString()}`) //sending without awaitng
        }
        count++
    }catch(e){
        failed++
        txTimeResponse = (Date.now() - t1)
        if(STORE_DATA=="TRUE"){
            append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count).toString()}`) //sending without awaitng
        }
    }

    if((count+failed)===numberOfTransactions){
        helper.showResponseResults(failed,txTimeResponse/1000,numberOfTransactions)
        console.log("All done!!")
    }
}

helper.sendVerifyPrivateTransactionAndProcessIncommingTx = async (contractAddress,privacyGroupId,t1,fileNameResponse,numberOfTransactions) => {
    let txTimeResponse
    try{
        //await storeValueFromNode1(contractAddress,1000,privacyGroupId,helper.generateKey())
        const t = await storeValueFromNode1(contractAddress,1000,privacyGroupId,helper.generateKey())//this program stores
        //the data and verifies all participants have correctly stored the value on their private orion database
        const k =  {k1:helper.generateKey(),k2:helper.generateKey(),k3:helper.generateKey()}
        const isStoredOnAllParticipants = await verifyTx(contractAddress,privacyGroupId,k)
        
        txTimeResponse = (t - t1)
        if(STORE_DATA=="TRUE"){
        //append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(numberOfTransactions-count).toString()}`) //sending without awaitng
            if(isStoredOnAllParticipants){                
                append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count+1).toString()}`) //sending without awaitng
                count++
            }else{
                failedForNotDelivered++
                console.log("Not correctly stored on all participant nodes, error in test number: ",count+failed+failedForNotDelivered)
                append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count).toString()}`) //sending without awaitng                
            }
        }
    }catch(e){
        failed++
        txTimeResponse = (Date.now() - t1)
        console.log(`Error with transaction N° ${count+failed} => ${e.message}\n`)// this error occurred in privateKey: ${privKey}`)
        if(STORE_DATA=="TRUE"){
            append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count).toString()}`) //sending without awaitng
        }
    }

    if((count+failed)===numberOfTransactions){
        helper.showResponseResults(failed,txTimeResponse/1000,numberOfTransactions)
        console.log("All done!!")
    }
}

helper.sendPrivateTransactionAndProcessIncommingTx = async (contractAddress,privacyGroupId,t1,fileNameResponse,numberOfTransactions) => {
    let txTimeResponse
    try{
        const t = await storeValueFromNode1(contractAddress,1000,privacyGroupId,helper.generateKey())                
        txTimeResponse = (t - t1)
        if(STORE_DATA=="TRUE"){
            append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count+1).toString()}`) //sending without awaitng
            count++            
        }
    }catch(e){
        failed++
        txTimeResponse = (Date.now() - t1)
        console.log(`Error with transaction N° ${count+failed} => ${e.message}\n`)// this error occurred in privateKey: ${privKey}`)
        if(STORE_DATA=="TRUE"){
            append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count).toString()}`) //sending without awaitng
        }
    }

    if((count+failed)===numberOfTransactions){
        helper.showResponseResults(failed,txTimeResponse/1000,numberOfTransactions)
        console.log("All done!!")
    }
}



helper.showResponseResults = (failed,delta,numberOfTransactions) => {
    console.log("\n************RESPONSE STATISTICS***************")  
    console.log("N° processed Tx by Orion: ",numberOfTransactions-failed)
    console.log(`N° no processed txs: ${failed}`)
    console.log(`response time (s):  ${delta}` )
    console.log(`Effectiveness(%): ${(numberOfTransactions-failed)/numberOfTransactions*100}%`)  
    const rate = numberOfTransactions/(delta)*60
    console.log("Average responsiveness rate: ",rate, "tx/m")
}

module.exports = helper