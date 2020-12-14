const fs = require("fs");
const path = require("path");

const Web3 = require("web3");
const EEAClient = require("../../src");

const createGroup = require("../privacyGroupManagement/createPrivacyGroup");

const { orion, besu, NETWORK_ID } = require("../keys.js");

const binary = fs.readFileSync(
  path.join(__dirname, "../solidity/EventEmitter/EventEmitter.bin")
);

const binaryMRA = fs.readFileSync(
  path.join(__dirname, "../solidity/MRA/MRA.bin")
);

const web3 = new EEAClient(new Web3(besu.node1.url), NETWORK_ID);

const createGroupId = () => {
  return createGroup.createPrivacyGroupForNode123();
};

const createPrivateEmitterContract = async(privacyGroupId,privateKey) => {
  const contractOptions = {
    data: `0x${binary}`,
    privateFrom: orion.node1.publicKey,
    privacyGroupId,
    privateKey //besu.node1.privateKey
  };
  const transactionHash = await web3.eea.sendRawTransaction(contractOptions);
  return transactionHash
};

const createPrivateMRAContract = async(privacyGroupId,privateKey) => {
  const contractOptions = {
    data: `0x${binaryMRA}`,
    privateFrom: orion.node1.publicKey,//orion.node1.publicKey,
    privacyGroupId,
    privateKey //besu.node1.privateKey
  };
  const transactionHash = await web3.eea.sendRawTransaction(contractOptions);
  return transactionHash
};

const getPrivateContractAddress = transactionHash => {
  console.log("Transaction Hash ", transactionHash);
  return web3.priv
    .getTransactionReceipt(transactionHash, orion.node1.publicKey)
    .then(privateTransactionReceipt => {
      console.log("Private Transaction Receipt\n", privateTransactionReceipt);
      return privateTransactionReceipt.contractAddress;
    });
};

const deployer = async (privateKey) => {
  const privacyGroupId = await createGroupId();
  const transactionHash = await createPrivateEmitterContract(privacyGroupId,privateKey)
  const contractAddress =  await getPrivateContractAddress(transactionHash)
  return { contractAddress, privacyGroupId }
};

module.exports = {deployer,createPrivateEmitterContract,createPrivateMRAContract,getPrivateContractAddress}

if (require.main === module) {
  module.exports();
}
