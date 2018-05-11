const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const ethTx = require('ethereumjs-tx');
// const credentials =   {  network: '',
// infura_api_key: '',
// cps_public_key: '',
// cps_private_key: ''
// }
// try {
//     credentials = require('credentials')
// } catch (error) {
//     console.log('No credentials found')

// }
const keys =  require('./keys')

// Compile the source code
const input = fs.readFileSync('contracts/CPS.sol');

const output = solc.compile(input.toString(), 1);
//console.log(output)
const abi = JSON.parse(output.contracts[':CPS'].interface);
// Connect to Infura Ethereum node

const gasLimit = 3000000;
const gasPrice = 2000000000; //2 gwei
//2000000000 = 2 gwei
//web3.eth.defaultAccount = keys.cps_public_key;

exports.createNewCustomerContract = function(request_data) {

    const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ request_data.netType +".infura.io/"+keys[request_data.netType].infura_api_key));

    var netId;
    var transactionCount;
    console.log("Deploying contract...")
    return new Promise(function(resolve,reject){
        web3.eth.net.getId().then(function(res){
            netId=res;

            web3.eth.getTransactionCount(keys[request_data.netType].cps_public_key).then(function(res){
                transactionCount=res;

                const bytecode = output.contracts[':CPS'].bytecode;
                //console.log("bytecode: "+bytecode)
                var rawTx = {
                   nonce: web3.utils.toHex(transactionCount),
                   chainId: netId,//web3.utils.toHex(3),
                   gasLimit: web3.utils.toHex(gasLimit),
                    gasPrice: web3.utils.toHex(gasPrice),
                    data: '0x'+ bytecode,
                    from: keys[request_data.netType].cps_public_key
                };

                web3.eth.accounts.signTransaction(rawTx, keys[request_data.netType].cps_private_key).then(signed => {

                    
                    var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

                    tran.on('transactionHash', hash => {
                      // Send response to client
                      console.log("Tx Hash: " +  hash);
                      resolve(hash);
                    });
                
                    tran.on('receipt', receipt => {
                    
                        console.log("Contract deployed...");
                    
                     // block mined, now kickoff create customer function
                    // console.log(receipt)
                     var address = receipt.contractAddress
                      createCustomer(request_data, address);
                     // resolve(receipt.contractAddress);

                    });
                
                    tran.on('error',err=>{
                        console.log(err)
                    });
                  });
    
                  
            })
        })
    
    })


}




function createCustomer(request_data, contractAddress){

    console.log("Creating customer...")

    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var data = contractInstance.methods.createCustomer(request_data.name,request_data.id).encodeABI();

    
    sendSign(data, contractAddress, addFirstWarranty, request_data);

}


// var contractInstance = new web3.eth.Contract(abi, '0x26e9A41FFa520C20b81a23E4B4667886D398D638');
// contractInstance.methods.getWarrantyCount().call().then(res=>{
//     console.log(res)
// })

function addFirstWarranty(request_data, contractAddress ){

    console.log("Adding warranty.......")
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var data = contractInstance.methods.addWarranty(request_data.cya_warrantyserial, request_data.items).encodeABI();
    
    sendSign(data, contractAddress, null, null);
}

exports.addNewWarranty = function(request_data){

    const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ request_data.netType +".infura.io/"+keys[request_data.netType].infura_api_key));

    // First get the contract address
    return new Promise(function(resolve,reject){
        web3.eth.getTransactionReceipt(request_data.contract_tx_hash).then(res=>{
        
        var contractAddress = res.contractAddress;
        
        resolve(contractAddress);
        var contractInstance = new web3.eth.Contract(abi, contractAddress);
        var data = contractInstance.methods.addWarranty(request_data.cya_warrantyserial, request_data.items).encodeABI();
            
        sendSign(data, contractAddress, null, null);


        })
    })


}



exports.getWarranties = function(contract_address, netType){

    const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ netType +".infura.io/"+keys[netType].infura_api_key));


    var contractInstance = new web3.eth.Contract(abi, contract_address);

        // Returns promise object all warranties
        return new Promise(function(resolve, reject){

                   
        // First get count of warranty array
        contractInstance.methods.getWarrantyCount().call().then(function(count){
            
            var count = parseInt(count)

            // Then loop through and get each warranty
            contractInstance.methods.getWarrantyByArrayIndex(0).call().then(function(warranty){

                var warranty_object = {
                    "cya_warrantyserial":warranty[0],
                    "model_name":warranty[1],
                    "manufacturer": warranty[2]
                    }
                resolve(warranty_object)
            })

        })
            
        })
}

function sendSign(data, contractAddress, callbackFunction, request_data){
 
    const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ request_data.netType +".infura.io/"+keys[netType].infura_api_key));


        var netId;
        var transactionCount;

            web3.eth.net.getId().then(function(res){
                netId=res;
                
                web3.eth.getTransactionCount(keys[request_data.netType].cps_public_key).then(function(res){
                    transactionCount=res;
                    //console.log(transactionCount)
            var rawTx = {
                nonce:  web3.utils.toHex(transactionCount),
                chainId: netId,//web3.utils.toHex(3),
                gasLimit: web3.utils.toHex(gasLimit),
                 gasPrice: web3.utils.toHex(gasPrice),
                 data:  web3.utils.toHex(data),
                 from:  keys[request_data.netType].cps_public_key,
                 to: contractAddress
             };
            
            
             console.log('Sending signed ...')
       
             web3.eth.accounts.signTransaction(rawTx, keys[request_data.netType].cps_private_key).then(signed => {
                console.log('Signing done, now sending...')
                var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
                console.log('Sending done...')
                tran.on('transactionHash', hash => {
                  // Send response to client
                  console.log("Tx Hash: " +  hash);
                  
                });
            
                tran.on('receipt', receipt => {
  
                    console.log("Receipt, at " +new Date()+  ":"+ receipt.contractAddress);
                    if (callbackFunction!=null){
                        callbackFunction(request_data, contractAddress)
                    }
                
                });
              
               tran.on('error',console.error);
              });
            
            })
            })
        
   
    
   
}

