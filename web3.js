const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const ethTx = require('ethereumjs-tx');

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/6Z8pW5MQzU4t0YIjKXVK"));

const addressFrom = '0xd968F006E86C045B9e69754CF256955336c1a082'
const privKey = '3cfc558703d00da417b82fcfaa622b394f4705ef285f09bf7a40cd24bdc0d6c0'

const addressTo = '0x55C4bC75adcD82332CbF463bD9b7B92f4130Fb51'
var version = web3.version.api;
console.log(version); // "0.2.0"
web3.eth.getTransactionCount(addressFrom).then(txCount => {

    // construct the transaction data
    const txParams = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(25000),
      gasPrice: web3.utils.toHex(10e9), // 10 Gwei
      to: addressTo,
      from: addressFrom,
      value: web3.utils.toHex(web3.utils.toWei(123, 'wei'))
    }
    // Transaction is created
    const tx = new ethTx(txParams);
    const privKey = Buffer.from(privKey, 'hex');
    // Transaction is signed
    tx.sign(privKey);
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    console.log(rawTx);
  
  })




// Compile the source code
const input = fs.readFileSync('contracts/CPS.sol');
const output = solc.compile(input.toString(), 1);

const bytecode = output.contracts[':CPS'].bytecode;
const abi = JSON.parse(output.contracts[':CPS'].interface);

web3.eth.defaultAccount = web3.eth.accounts[0];

// Contract object
const contract = web3.eth.contract(abi);

exports.creatNewCustomerContract = function(id, name){
    // Contract object
    const contract = web3.eth.contract(abi);
    // Returns promise object with tx hash after completing
    return new Promise(function(resolve, reject){
        contract.new({
            data: '0x' + bytecode,
            from: web3.eth.defaultAccount,
            gas: 3000000
        }, (err, res) => {
            if (err) {
                console.log(err);
                resolve(false);
            }

            // If we have an address property, the contract was deployed
            if (res.address) {

                // Create customer in contract
                contractInsance = contract.at(res.address);
                
                contractInsance.createCustomer.call(name, id, {
                    gas:3000000,
                    from: web3.eth.defaultAccount
                })
                
                resolve({"Contract address":res.address, "Tx hash":res.transactionHash});
                
            }
        });

    })

}

exports.addNewWarranty =  function(contract_address, warrantyserial, model_id, model_name, manufacturer){

    const contractInstance = contract.at(contract_address);

    // Returns promise object with tx hash after completing warranty update
    return new Promise(function(resolve, reject){
        contractInstance.addWarranty.call(warrantyserial,model_id, model_name, manufacturer,{
            gas:3000000,
            data:{},
            from: web3.eth.accounts[0]
        }, (err,res) => {
            console.log("Res "+res.address);
            console.log("Error "+err);
            resolve(res);
        })
    })
      //  try {
            
        // } 
        // catch (error) {
        //     reject(error)
        // }

    }


exports.getWarranties = function(contract_address){

        contractInstance = contract.at(contract_address);
    // Returns promise object all warranties
        return new Promise(function(resolve, reject){

            //var count = contractInstance.getWarrantyCount();
            console.log( contractInstance.getWarrantyCount())
            resolve(2);
            
        })

}

