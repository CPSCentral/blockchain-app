const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');


// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

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
