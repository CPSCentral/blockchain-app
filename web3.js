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

const abi = JSON.parse(output.contracts[':CPS'].interface);
// Connect to Infura Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("https://"+ keys.network +".infura.io/"+keys.infura_api_key));

const gasLimit = 3000000;
const gasPrice = 2000000000; //2 gwei
//2000000000 = 2 gwei
web3.eth.defaultAccount = keys.cps_public_key;



exports.creatNewCustomerContract = function(request_data) {

    var netId;
    var transactionCount;
    console.log("Deploying contract...")
    return new Promise(function(resolve,reject){
        web3.eth.net.getId().then(function(res){
            netId=res;

            web3.eth.getTransactionCount(keys.cps_public_key).then(function(res){
                transactionCount=res;
    
                const bytecode = output.contracts[':CPS'].bytecode;
                //console.log("bytecode: "+bytecode)
                var rawTx = {
                   nonce: web3.utils.toHex(transactionCount),
                   chainId: netId,//web3.utils.toHex(3),
                   gasLimit: web3.utils.toHex(gasLimit),
                    gasPrice: web3.utils.toHex(gasPrice),
                    data: '0x'+ bytecode,
                    from: keys.cps_public_key
                };
    
                web3.eth.accounts.signTransaction(rawTx, keys.cps_private_key).then(signed => {
                    var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
                
                    tran.on('transactionHash', hash => {
                      // Send response to client
                      console.log("Tx Hash: " +  hash);
                      resolve(hash);
                    });
                
                    tran.on('receipt', receipt => {
                    
                        console.log("Function mined...");
                    
                     // block mined, now kickoff create customer function
                    // console.log(receipt)
                     var address = receipt.contractAddress
                      createCustomer(request_data, address);
                     // resolve(receipt.contractAddress);

                    });
                
                 //   tran.on('error',reject(false));
                  });
    
                  
            })
        })
    
    })


}




function createCustomer(request_data, contractAddress){

    console.log("Creating customer...")

    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var data = contractInstance.methods.createCustomer(request_data.name,request_data.id).encodeABI();

    sendSign(data, contractAddress).then(function(res){

        addWarranty(request_data, contractAddress);
    })

}

function addWarranty(request_data, contractAddress ){

    console.log("Adding warranty...")
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var data = contractInstance.methods.addWarranty(request_data.cya_warrantyserial, request_data.model_id, request_data.model_name, request_data.manufacturer).encodeABI();
    
    sendSign(data, contractAddress);
}

exports.addNewWarranty =  function(contract_address, warrantyserial, model_id, model_name, manufacturer){

    const contractInstance = contract.at(contract_address);


        contractInstance.addWarranty.call(warrantyserial,model_id, model_name, manufacturer,{
            gas:3000000,
            data:{},
            from: web3.eth.accounts[0]
        }, (err,res) => {
         //   console.log("Res "+res.address);
            console.log("Error "+err);
          //  resolve(res);
        })
    

    }



exports.getWarranties = function(contract_address){

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

function sendSign(data, contractAddress){
 
 
        var netId;
        var transactionCount;
        
        web3.eth.net.getId().then(function(res){
            netId=res;

            web3.eth.getTransactionCount(keys.cps_public_key).then(function(res){
                transactionCount=res;
                //console.log(transactionCount)
        var rawTx = {
            nonce:  web3.utils.toHex(transactionCount),
            chainId: netId,//web3.utils.toHex(3),
            gasLimit: web3.utils.toHex(gasLimit+1),
             gasPrice: web3.utils.toHex(gasPrice),
             data:  web3.utils.toHex(data),
             from: keys.cps_public_key,
             to: contractAddress
         };
        
        
         console.log('Sending signed ...')
         web3.eth.accounts.signTransaction(rawTx, keys.cps_private_key).then(signed => {
            console.log('Signing done, now sending...')
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
            console.log('Sending done...')
            tran.on('transactionHash', hash => {
              // Send response to client
              console.log("Tx Hash: " +  hash);
           //   resolve(hash)
            });
        
            tran.on('receipt', receipt => {
            
                console.log("Receipt, at " +new Date()+  ":"+ receipt.contractAddress);
        
            });
        
            tran.on('error',console.error);
          });
        
        })
        })
    
   
}

