# Orion Data Sender Test

In this test Orion will be tested by sending a configurable amount of data

## Requirements

* Two nodes are required; each of these consisting of a pair orion/besu

## Tested versions

* Orion: 1.4.0/1.6.0

* Besu: 1.3.6/20.x

## How to use

* **important**. Open a terminal in the path where this file is located

* Execute telnet to verify you have access to both pairs (orion/besu) that interact
  * Telnet to each besu
  * telnet to at least one orion you are going to connect via 4040 port
  * send hello world message between orion managers

* To create a privacy group set the following environment variables in the **env-1.sh**:

```shell
export ORION_NODE_FROM_IP=127.0.0.1 # The node-1 Orion IP address, REPLACE THIS- DO NOT COPY-PASTE
export ORION_NODE_FROM_PORT=8888   # The node-1 Orion Client PORT number, REPLACE THIS- DO NOT COPY-PASTE
export ORION_PUB_KEY_FROM=HzrdZbdTzG9UxtkIpUv8uH1LaVcQUxbGeXfG6yev7WM= #NODE-1 ORION-PUBLIC KEY, REPLACE THIS- DO NOT COPY-PASTE
export ORION_PUB_KEY_TO_1=3qQwCierJs7EnYaAYLtQmxfXDIyVwMLW2LCB2iOdRBs= #NODE-2 ORION-PUBLIC KEY, REPLACE THIS- DO NOT COPY-PASTE
```

Now simply execute:

```shell
source env-1.sh
```

* Now create a private group with:

```shell
node createPrivacyGroup.js
```

After successfully running you should see a message something like this:

```shell
{ privacyGroupId: '4q6CW6H8Rv00Uk+19O5LbROYsTM46ZAUvuynuIM6hcE=',
  name: 'Organisation A',
  description: 'Contains members of Organisation A',
  type: 'PANTHEON',
  members: 
   [ 'HzrdZbdTzG9UxtkIpUv8uH1LaVcQUxbGeXfG6yev7WM=',
     '3qQwCierJs7EnYaAYLtQmxfXDIyVwMLW2LCB2iOdRBs=' ] }
```

* Add the privacyGroupId in the env-1.sh obtained in the previous step:

```shell
export PRIVACY_GROUP_ID=4q6CW6H8Rv00Uk+19O5LbROYsTM46ZAUvuynuIM6hcE= #REPLACE THIS- DO NOT COPY-PASTE
```

* Also Add the following envrionment variables in env.sh:

```shell
export IP_FROM=127.0.0.1 #The node-1 IP address where Besu exposes its RPC, REPLACE THIS- DO NOT COPY-PASTE
export IP_TO_1=34.75.159.76 #The node-2 IP address where Besu exposes its RPC, REPLACE THIS- DO NOT COPY-PASTE
export PORT_FROM=8545 #The node-1 PORT number where Besu exposes its RPC, REPLACE THIS- DO NOT COPY-PASTE
export PORT_TO_1=4545 #The node-1 PORT number where Besu exposes its RPC, REPLACE THIS- DO NOT COPY-PASTE
export ORION_PUB_KEY_FROM=HzrdZbdTzG9UxtkIpUv8uH1LaVcQUxbGeXfG6yev7WM= #NODE-1 ORION-PUBLIC KEY, REPLACE THIS- DO NOT COPY-PASTE
export ORION_PUB_KEY_TO_1=3qQwCierJs7EnYaAYLtQmxfXDIyVwMLW2LCB2iOdRBs= #NODE-2 ORION-PUBLIC KEY, REPLACE THIS- DO NOT COPY-PASTE
export NETWORK_ID=648531 #REPLACE THIS- DO NOT COPY-PASTE
```

Make all those variables available with:

```shell
source env-1.sh
```

## Testing

The following test sends a random string of 25 characters by using a simple method which also emit events.
In this test transactions will be sent through the configured node-2; then verifications about (emitted events and verifications if the value was correctly stored)

* Running one iteration:

```shell
(source env-1.sh && node rmaEventEmitter.js)
```

* Running 2000 iterations:

```shell
(for i in {1..2000};do echo " " && echo "****************** ITERATION $i *******************************";(source env-1.sh && node rmaEventEmitter.js ) && sleep 4; echo " ";done) > ../../logs/data-logs 2>&1 &
```

**note** Adjust the iterations according to the number of times you want to execute the rmaEventEmitter.js

* Check the logs with:

```shell
tail -F ../../logs/data-logs
```
