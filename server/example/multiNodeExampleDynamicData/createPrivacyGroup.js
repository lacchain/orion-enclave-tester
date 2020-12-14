const axios = require('axios')

const ORION_IP = process.env.ORION_NODE_FROM_IP;
const ORION_PORT = process.env.ORION_NODE_FROM_PORT;
const ORION_1_PUBLIC_KEY=process.env.ORION_PUB_KEY_FROM;
const ORION_2_PUBLIC_KEY=process.env.ORION_PUB_KEY_TO_1;

const URL_ORION = `http://${ORION_IP}:${ORION_PORT}/createPrivacyGroup`

const data = {
    addresses: [
        `${ORION_1_PUBLIC_KEY}`,
        `${ORION_2_PUBLIC_KEY}`
      ],
     from: `${ORION_1_PUBLIC_KEY}`,
     name: "Organisation A",
     description: "Contains members of Organisation A"
}

const createPrivateGroup = async () =>{    
    try {
        await axios.post(URL_ORION,data).then(r=>{
            console.log(r.data)
        })        

    }catch(e){
        console.log(e.message)
    }
}

createPrivateGroup()
