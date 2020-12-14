const Web3 = require("web3");
const helper = require("../../lib/helpers");
const EEAClient = require("../../src");
const EventEmitterAbi = require("../solidity/EventEmitter/EventEmitter.json")
  .output.abi;

const { orion, besu, NETWORK_ID } = require("../keys.js");
const web3_node1 = new EEAClient(new Web3(besu.node1.url), NETWORK_ID);

const storeValueFromNode1 = async (address, value, privacyGroupId,privateKey) => {
  const contract = new web3_node1.eth.Contract(EventEmitterAbi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find(e => {
    return e.name === "store";
  });
  const functionArgs = web3_node1.eth.abi
    .encodeParameters(functionAbi.inputs, [value])
    .slice(2);

  const functionCall = {
    to: address,
    data: functionAbi.signature + functionArgs,
    privateFrom: orion.node1.publicKey,
    privacyGroupId,
    privateKey
  };
  const transactionHash = await  web3_node1.eea.sendRawTransaction(functionCall)
  const result = await web3_node1.priv.getTransactionReceipt(
    transactionHash,
    orion.node1.publicKey
  )
  // try{
  //   console.log("Event Emited:", result.logs[0].data);
  // }catch(e){
  //   console.log("There is nothing on result.logs[0].data ...")
  //   console.log("Printing result.logs")
  //   console.log(result.logs)
  // }

  const t = Date.now()


  return t  
};

const getValue = (url, address, privateFrom, privacyGroupId, privateKey) => {
  const web3 = new EEAClient(new Web3(url), NETWORK_ID);
  const contract = new web3.eth.Contract(EventEmitterAbi);

  // eslint-disable-next-line no-underscore-dangle
  const functionAbi = contract._jsonInterface.find(e => {
    return e.name === "value";
  });

  const functionCall = {
    to: address,
    data: functionAbi.signature,
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
      console.log(`Get Value from ${url}:`, result.output);
      return result;
    });
};

const getValueFromNode1 = (address, privacyGroupId,privateKey) => {
  return getValue(
    besu.node1.url,
    address,
    orion.node1.publicKey,
    privacyGroupId,
    privateKey//besu.node1.privateKey
  );
};

const getValueFromNode2 = (address, privacyGroupId,privateKey) => {
  return getValue(
    besu.node2.url,
    address,
    orion.node2.publicKey,
    privacyGroupId,
    privateKey//besu.node2.privateKey
  );
};

const getValueFromNode3 = (address, privacyGroupId,privateKey) => {
  return getValue(
    besu.node3.url,
    address,
    orion.node3.publicKey,
    privacyGroupId,
    privateKey//besu.node3.privateKey
  );
};

const verifyTx  = async (address, privacyGroupId,k) => {
  try{
    const {k1,k2,k3} = k
    await getValueFromNode1(address,privacyGroupId,k1)
    await getValueFromNode2(address,privacyGroupId,k2)
    await getValueFromNode3(address,privacyGroupId,k3)
    return true
  }catch(e){
    console.log("Error when verifying transactions ===>",e)
    return false
  }  
}

module.exports = {
  storeValueFromNode1,
  getValueFromNode1,
  getValueFromNode2,
  getValueFromNode3,
  verifyTx
};

if (require.main === module) {
  if (!process.env.CONTRACT_ADDRESS) {
    throw Error(
      "You need to export the following variable in your shell environment: CONTRACT_ADDRESS="
    );
  }

  if (!process.env.PRIVACY_GROUP_ID) {//bWHHcLwAAEFpwkky0zgacgYprN+8z0dlZWaXY4RHGXE=
    throw Error(
      "You need to export the following variable in your shell environment: PRIVACY_GROUP_ID="
    );
  }

  const address = process.env.CONTRACT_ADDRESS;
  const privacyGroupId = process.env.PRIVACY_GROUP_ID;
  storeValueFromNode1(address, 1000, privacyGroupId,helper.generateKey())
    .then(() => {
      return getValueFromNode1(address, privacyGroupId,helper.generateKey());
    })
    .then(() => {
      return getValueFromNode2(address, privacyGroupId,helper.generateKey());
    })
    .then(() => {
      return getValueFromNode3(address, privacyGroupId,helper.generateKey());
      return
    })
    .catch(console.log);
}
