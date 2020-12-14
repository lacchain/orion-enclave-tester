const fs = require("fs");
const path = require("path");

const Web3 = require("web3");
const { readPlainData } = require("../../lib/data");
const { createRandomString } = require("../../lib/helpers");
const EEAClient = require("../../src");
const RMAEmitterAbi = require("../solidity/MRA/MRA.json")
  .output.abi;

const { orion, besu, NETWORK_ID } = require("../keys.js");
const PRIVACY_GROUP_ID = process.env.PRIVACY_GROUP_ID;

const {v4} = require("uuid")

const binary = fs.readFileSync(
  path.join(__dirname, "../solidity/MRA/MRA.bin")
);

const web3 = new EEAClient(new Web3(besu.node1.url), parseInt(NETWORK_ID));

const createPrivateEmitterContract = (privacyGroupId) => {
  const contractOptions = {
    data: `0x${binary}`,
    privateFrom: orion.node1.publicKey,
    privacyGroupId,
    privateKey: besu.node1.privateKey
  };
  
  //console.log(contractOptions)
  return web3.eea.sendRawTransaction(contractOptions);
};

const getPrivateContractAddress = transactionHash => {
  //console.log("Transaction Hash ", transactionHash);
  return web3.priv
    .getTransactionReceipt(transactionHash, orion.node1.publicKey)
    .then(privateTransactionReceipt => {
      //console.log("Private Transaction Receipt\n", privateTransactionReceipt);
      return privateTransactionReceipt.contractAddress;
    });
};

const storeValue = async(url,publicKey,privateKey,address, privacyGroupId,tin,certificateData) => {
  const web3 = new EEAClient(new Web3(url), parseInt(NETWORK_ID));
  const contract = new web3.eth.Contract(RMAEmitterAbi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find(e => {
    return e.name === "addCertificate";
  });

  //[{"name":"TIN","type":"string"},{"name":"certificate","type":"string"},{"name":"state","type":"string"},{"name":"observation","type":"string"},{"name":"visible","type":"bool"}]
  const functionArgs = web3.eth.abi
    .encodeParameters(functionAbi.inputs, [tin,certificateData,"sent","continousllySeen",true])
    .slice(2);

  const functionCall = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateFrom: publicKey,
    privacyGroupId,
    privateKey
  };
  //console.log(functionCall)
  return web3.eea
    .sendRawTransaction(functionCall)
    .then(transactionHash => {
      //console.log("Transaction HASH: " + transactionHash)
      return transactionHash;
    })
};

const decodeCertificateAddedLog = data => {
  const eventStructure = [
    {
      type:'string',
      name: 'TIN'
    },
    {
      type:'address',
      name:'owner',
      indexed: true
    }
  ]
  //CertificateAdded(string,address) ==> keccak256 => 6dae487072a0ae0f2473b3117e73cde4322a2d1201b97a8aa6e0c73e6adf6dfc
  const eventSignature = "0x6dae487072a0ae0f2473b3117e73cde4322a2d1201b97a8aa6e0c73e6adf6dfc"
  const decodedEvent = web3.eth.abi.decodeLog(eventStructure,data,[eventSignature])
  //console.log("decoded event: " + JSON.stringify(decodedEvent))
  return decodedEvent;
}

const getTransactionLogFromNode = (url,transactionHash,publicKey) => {
  const web3 = new EEAClient(new Web3(url), parseInt(NETWORK_ID));
  return web3.priv.getTransactionReceipt(
    transactionHash,
    publicKey
  )
  .then(txReceipt => {
    //console.log("logs in " + url + " " + txReceipt.logs[0])
    return txReceipt.logs[0].data
  });
}

const storeValueFromNode1 = (address, privacyGroupId,tin,certificateData) => {
  console.log("**** Storing certificate from Node 1 ****")
  return storeValue(besu.node1.url,orion.node1.publicKey,besu.node1.privateKey,address,privacyGroupId,tin,certificateData)
};

const storeValueFromNode2 = (address, privacyGroupId,tin,certificateData) => {
  console.log("**** Storing certificate from Node 2 ****")
  return storeValue(besu.node2.url,orion.node2.publicKey,besu.node2.privateKey,address,privacyGroupId,tin,certificateData)
};

const getValueFromNode1 = (address, privacyGroupId,tin) => {
  console.log("\nGetting value form node 1: " + besu.node1.url)
  return getValue(
    besu.node1.url,
    address,
    orion.node1.publicKey,
    privacyGroupId,
    besu.node1.privateKey,
    tin
  );
};

const getValueFromNode2 = (address, privacyGroupId,tin) => {
  console.log("\nGetting value form node 2: " + besu.node2.url)
  return getValue(
    besu.node2.url,
    address,
    orion.node2.publicKey,
    privacyGroupId,
    besu.node2.privateKey,
    tin
  );
};

const decodeCertificate = data => {
  const eventStructure = [
    {
      type:'string',
      name: 'field1'
    },
    {
      type:'string',
      name: 'field2'
    },
    {
      type:'string',
      name: 'field3'
    },
    {
      type:'bool',
      name: 'boolValue'
    },
    {
      type:'address',
      name:'owner'
    }
  ]
  //getCertificate(string) ==> keccak256 => ed0f2e75597dc5e04d1f0277d4f8fb4ec0d87ba29afb63a94c39460249313aac
  const eventSignature = "0xed0f2e75597dc5e04d1f0277d4f8fb4ec0d87ba29afb63a94c39460249313aac"
  const decodedEvent = web3.eth.abi.decodeLog(eventStructure, data, [eventSignature])
  //console.log("decoded certificate: " + JSON.stringify(decodedEvent))
  return decodedEvent
}

const getValue = (url, address, privateFrom, privacyGroupId, privateKey,tin) => {
  const web3 = new EEAClient(new Web3(url), parseInt(NETWORK_ID));
  const contract = new web3.eth.Contract(RMAEmitterAbi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find(e => {
    return e.name === "getCertificate";
  });

  const functionArgs = web3.eth.abi
    .encodeParameters(functionAbi.inputs, [tin])
    .slice(2);
    
  const functionCall = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateFrom,
    privacyGroupId,
    privateKey
  };

  return web3.eea
    .sendRawTransaction(functionCall)
    .then(transactionHash => {
      return web3.priv.getTransactionReceipt(
        transactionHash,
        orion.node1.publicKey
      );
    })
    .then(result => {
      //console.log(`Get Value from ${url}:`, result.output);
      return result;
    });
};

const getContractAddress = async () => {
  if(process.env.CONTRACT_ADDRESS){
    console.log("Using existing contract at " +  process.env.CONTRACT_ADDRESS + " direction")
    return process.env.CONTRACT_ADDRESS
  }

  console.log("Deploying a new contract ...")
  return createPrivateEmitterContract(PRIVACY_GROUP_ID)
  .then(getPrivateContractAddress)
  .catch(console.error)
}

getContractAddress()
  .then(async(contractAddress) => {
    console.log("Obtained contract address: " + contractAddress)
      const tin=v4()
      console.log("Generated TIN: " + tin)
      const certificateData = createRandomString(25)
      console.log("Sent Data: " + certificateData)
      //const certificateData = await readPlainData("","data2343")
      //console.log("Generated random data: " + certificateData + "\n")
      
      //#######################################################
      console.log("\n\n**********#######################################################************")
      console.log("************Starting process ... storing from node 2********")
      return storeValueFromNode2(contractAddress, PRIVACY_GROUP_ID,tin,certificateData)      
      .then(transactionHash => {
        //#######################################################
        console.log("\n\n************Verifying logs has been received on both participants********")
        console.log("\nGetting decoded event from node 1")        
        getTransactionLogFromNode(besu.node1.url,transactionHash,orion.node1.publicKey)
        .then(data=>{
          console.log("node 1")
          const decoded = decodeCertificateAddedLog(data)
          if(decoded["0"]==tin){
            console.log("TIN correctly received via private logs in node 1")
          }else{
            console.log("Node 1: Something were wrong ... TIN does not match, received TIN is " + decoded["0"] )
          }          
          return decoded
        })
        .then(()=>{
          console.log("\nGetting decoded event from node 2")
          getTransactionLogFromNode(besu.node2.url,transactionHash,orion.node2.publicKey)
          .then(data=>{
            console.log("node 2")
            const decoded = decodeCertificateAddedLog(data)
            if(decoded["0"]==tin){
              console.log("TIN correctly received via private logs in node 2")
            }else{
              console.log("Node 2: Something were wrong ... TIN does not match, received TIN is " + decoded["0"] )
            }    
            return decoded
          })

        //#######################################################
        //Verifying data has been saved on both participants        
          .then(() => {
            console.log("\n\n***********Verifying data has been saved on both participants*********")
            return getValueFromNode1(contractAddress,PRIVACY_GROUP_ID,tin)
          }).then(({output}) => {
            const decoded = decodeCertificate(output)
            if(decoded["0"]==certificateData){
              console.log("Data correctly received via orion")
            }else{
              console.log("Node 1: Something were wrong ... data does not match, with generated one ")
            }
            return output;
          }).then(()=>{
            return getValueFromNode2(contractAddress,PRIVACY_GROUP_ID,tin)
          }).then(({output}) => {
            const decoded = decodeCertificate(output)
            if(decoded["0"]==certificateData){
              console.log("Data correctly received via orion")
            }else{
              console.log("Node 1: Something were wrong ... data does not match, with generated one ")
            }
            return output;
          })

        })
      })      
    })
    .catch(console.log);
