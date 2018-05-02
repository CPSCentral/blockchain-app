const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const ethTx = require('ethereumjs-tx');
const credentials = require('./credentials')

// Compile the source code
const input = fs.readFileSync('contracts/CPS.sol');
const output = solc.compile(input.toString(), 1);

const abi = JSON.parse(output.contracts[':CPS'].interface);

// Connect to Infura Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ credentials.network +".infura.io/"+credentials.infura_api_key));

const gasLimit = 3000000;
const gasPrice = 20000000; //2
//2000000000 = 2 gwei
web3.eth.defaultAccount = credentials.cps_public_key;

// Contract object
const contract = web3.eth.contract(abi);

exports.creatNewCustomerContract = function(id,name) {

    const bytecode = output.contracts[':CPS'].bytecode;
    //console.log("bytecode: "+bytecode)
    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(web3.eth.defaultAccount )),
        gasLimit: web3.toHex(gasLimit),
        gasPrice: web3.toHex(gasPrice),
        data: '0x'+ bytecode,
        from:credentials.cps_public_key
    };

    var privateKey = new Buffer(credentials.cps_private_key, 'hex');
    var transaction = new ethTx(rawTx);

    transaction.sign(privateKey);

    var serializedTx = transaction.serialize().toString('hex');

    return new Promise(function(resolve,reject){
        web3.eth.sendRawTransaction(
            '0x' + serializedTx, function(err, result) {
                if(err) {
                    reject(err)
                   console.log(err);
                } else {
                    waitToAddCustomer(id,name, result );
                    resolve(result);
                    console.log(result);
                }
            })
        }
    )

}

function waitToAddCustomer(id,name, txhash){
    
    var interval = 2000;
    var txFound = false;
    var count = 0;
    var maxLoops = 10;

    // Loop and find when transaction is mined
    var t = setInterval(function(){

        var receipt = web3.eth.getTransactionReceipt(txhash);
        if (receipt != null) {
            // Kickoff addWarranty using this contract address
            console.log('Found contract! Adding customer...')
            createCustomer(receipt.address, id, name);
            clearInterval(t);
        } else{
            console.log("Contract didn't finished mining, trying again...")
        }
        if( count > maxLoops){
            console.log('Max loops reached, exiting...')
            clearInterval(t);
        }
        count++;

    }, interval);

}

function createCustomer(contract_address, id, name){
    const contractInstance = contract.at(contract_address);
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



function sendEther(addressFrom, privKey, addressTo, ether_amount) {

    amount =  web3.toWei(ether_amount, "ether");
    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(addressFrom)),
        gasLimit: web3.toHex(21000),
        gasPrice: web3.toHex(10e9), //10Gwei
        to: addressTo,
        from:addressFrom,
        value: web3.toHex(web3.toBigNumber(amount))
    
    }
    
    var privateKey = new Buffer(privKey, 'hex');
    var transaction = new ethTx(rawTx);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');
    web3.eth.sendRawTransaction(
        '0x' + serializedTx, function(err, result) {
            if(err) {
                console.log('error');
                console.log(err);
            } else {
                console.log('success');
                console.log(result);
            }
        });
}


exports.getContractAddress = function(txHash){

    var interval = 500;
    var maxLoops = 10;
    
    return new Promise(function(resolve,reject){

        var txFound = false;
        var count =0;

        while (!txFound && count < maxLoops ){
            var receipt = web3.eth.getTransactionReceipt(txHash);
            if (receipt != null) {
                resolve(receipt);
                txFound=true;
            } 
            setTimeout(function(){
                console.log("tx not mined, looking again...");
            },interval);
            count++;
        }
        console.log("Not mined within max interval");
        reject(false);


    })

}

//this.getContractAddress('0xdaf5233fd2305ac19f6b9811b054fe107594a4c7cb3a09877d73a822482a53c9')

//.then(console.log);

