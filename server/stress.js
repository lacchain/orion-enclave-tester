const {deployer,createPrivateMRAContract,createPrivateEmitterContract,getPrivateContractAddress} = require("./example/multiNodeExamplePrivacyGroup/deployContract")
const {verifyDesiredRate,verifyTestime,verifyNumberOfContainers,sendPrivateTransactionAndProcessIncommingTx,generateKey} = require("./lib/helpers")
const {append} = require("./lib/logs")
const {DESIRED_RATE_TX,TEST_TIME_MINUTES,NUMBER_OF_CONTAINERS,STORE_DATA,ID} = require("./keys")


///////////////////////////////////VERIFICATIONS/////////////////////////////////////////////
const desiredRateTx = verifyDesiredRate(parseInt(DESIRED_RATE_TX))
const testTimeMinutes = verifyTestime(TEST_TIME_MINUTES)
const testTime = testTimeMinutes * 60//time in minutes => convert to seconds
const numerOfContainers = verifyNumberOfContainers(NUMBER_OF_CONTAINERS)
/**
 * @TODO => verify "ID"
 */
const id = ID

///////////////////////////////////PROCESS VARIABLES/////////////////////////////////////////////
let t1=null
let i = 0

const timeOut = 1/desiredRateTx * 1000
const numberOfTransactions = Math.ceil(desiredRateTx * testTime)
//log Files
let fileNameStimulus=`${id}-${desiredRateTx*numerOfContainers}-txsPerSec-${testTimeMinutes}-minutes-stimulus`
let fileNameResponse=`${id}-${desiredRateTx*numerOfContainers}-txsPerSec-${testTimeMinutes}-minutes-response`

let contractAddress
let privacyGroupId
let tPrevious

////////////////////////////CORE FUNCTIONS///////////////////////////////////////////////////
const initProgram =  async() => {
    try{
        //CONTRACT DEPLOYMENT//
        console.log("##################Contract Deployment##################")
        console.log("please wait...")
        if(process.env.PRIVACY_GROUP_ID){
          privacyGroupId=process.env.PRIVACY_GROUP_ID
          if(process.env.CONTRACT_ADDRESS){
            contractAddress=process.env.CONTRACT_ADDRESS
            console.log("Using existing contract address",contractAddress)
          }else{
            console.log("Entering to create a contract")            
            const transactionHash= await createPrivateEmitterContract(privacyGroupId,generateKey())
            //const transactionHash= await createPrivateMRAContract(privacyGroupId,generateKey())
            contractAddress =  await getPrivateContractAddress(transactionHash)
            console.log("Generated new Smart Contract",contractAddress)
            process.exit(0)
          }
        }else{
          const o = await deployer(generateKey())
          contractAddress = o.contractAddress
          privacyGroupId = o.privacyGroupId
          console.log("generated keys",o)
        }        
        // console.log("##################Starting sending transactions##################")
        t1 = Date.now()
        tPrevious = t1
        console.log(`Please wait; this test will aproximately take ${timeOut/1000*1*numberOfTransactions} seconds...`)
        //await sendTxs(start,contractAddress,privacyGroupId)
        if(contractAddress && privacyGroupId) sendTxs(numberOfTransactions);
    }catch(e){
        throw Error(
            e.message
        );
    }    
}

const publishData = () => {
    //****custom implementation****//
    sendPrivateTransactionAndProcessIncommingTx(contractAddress,privacyGroupId,t1,fileNameResponse,numberOfTransactions)
    //****************************//
}

//@TODO: improve file name and randomData
const logOutputAndPublish = (i) => {
  const txSendingTime = Date.now() - t1
  if(STORE_DATA=="TRUE"){
    append(`${fileNameStimulus}`,`${txSendingTime.toString()},${(i+1).toString()}`)
  }
  publishData()
}

const sendTxs =  numberOfTransactions => {  

  if(i<numberOfTransactions){
    //publishing
    logOutputAndPublish(i)
    
    //waiting
    while((Date.now() - tPrevious) < timeOut){
    //waiting => more precise   
    }

    tPrevious=Date.now()

     //Finishing
    if(i==numberOfTransactions-1){
      showStimulusResults()
    }

    //recursive
    i++
    setTimeout(()=>{
    sendTxs(numberOfTransactions)//using recursive strategy to achieve delay
    },0)
    //sendTxs(numberOfTransactions)//using recursive strategy to achieve delay
  }
}

///////////////////////////////////STIMULUS////////////////////////////////////////////////

const showStimulusResults = () => {
  console.log("\n************STIMULUS STATISTICS***************")
  const t2 = Date.now()
  console.log("N° sent Tx: ",numberOfTransactions)
  const delta = (t2-t1)/1000
  console.log("time (s):", delta)
  const rate = numberOfTransactions/(delta)
  console.log("Rate: ",rate, "tx/s")
}

////////////////////////////////////MAIN/////////////////////////////////////////////
initProgram()
