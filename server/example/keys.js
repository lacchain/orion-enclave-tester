/**
 * @TODO automate the test to include "n" nodes in the private transaction
 */
module.exports = {
  orion: {
    node1: {
      publicKey: process.env.ORION_PUB_KEY_FROM//"bKWqTPee92mHSj+X5EdIuOjv2XZgg32RrgAM/+yvUW4=" //bootnode3
    },
    node2: {
      publicKey: process.env.ORION_PUB_KEY_TO_1//"XjQ2ZERWty+3dgBcqk3KSFFSwDbgYqrV9ia2/Udzl2M=" //bootnode4
    },
    node3: {
      publicKey: process.env.ORION_PUB_KEY_TO_2//"eriiUlyYxQ1BxNjnq6HNMtVM5JOxgi2e+tDSKaxPx3I=" //
    }
  },
  besu: {
    node1: {
      url: `http://${process.env.IP_FROM}:${process.env.PORT_FROM}`,
      privateKey:
        "d553c2730a4b3c709cb969ddf0d87f2367d5515cb158c0f7eb0994d8a01dbb86"
    },
    node2: {
      url: `http://${process.env.IP_TO_1}:${process.env.PORT_TO_1}`,//rpc aduana 2
      privateKey:
        "d553c2730a4b3c709cb969ddf0d87f2367d5515cb158c0f7eb0994d8a01dbb86"
    },
    node3: {
      url: `http://${process.env.IP_TO_2}:${process.env.PORT_TO_2}`,//rpc aduana 2
      privateKey:
        "97a6da8834e04ec24f0747aa822e25c1b65c6429e0570cbef5c714c60dfa675d"
    }
  },
  NETWORK_ID:process.env.NETWORK_ID
};