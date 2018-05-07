var express    = require('express');   
var app        = express(); 
var port = process.env.PORT || 8080;      
var blockchain = require('./web3.js');
var bodyParser     =        require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    console.log("request for /")
    res.json({ message: 'hooray! welcome to our api!' });   
});

app.get('/get-address', function(req, res) {
   blockchain.getContractAddress(req.query.hash).then(function(resolve, reject){
    console.log(resolve);
    res.json(resolve);
})
  
});

app.post('/new-warranty', function(req, res) {
    
    console.log("Received request for new warranty...!")
    var response = {"repeating customer":false,
                    "Tx Hash":""}

    // First check if first time customer by looking for contract hash in request
    if (req.body.contract_address){
        // Repeating customer
        console.log("Repeating customer!")
        response["repeating customer"] = true;
        var contract_address = req.body.contract_address;
        var warrantyserial = req.body.warrantyserial;
        var model_id = req.body.model_id;
        var model_name = req.body.model_name;
        var manufacturer = req.body.manufacturer;

        if( ( warrantyserial && model_id && model_name && manufacturer) ===undefined ){
            res.json({"message":"Transaction failed, missing required parameter"})
        }else{

            // Now update his existing contract
            blockchain.addNewWarranty(contract_address, warrantyserial, model_id, model_name, manufacturer).then(function(hash){
                response["New Warranty"]["Tx Hash"]=hash;
                res.json(response);
            }) 
        }

    }else{
        // New customer - create a new contract
        console.log("New customer!")
        var name = req.body.name;
        var id = req.body.id;
        var warrantyserial = req.body.cya_warrantyserial;
        var model_id = req.body.model_id;
        var model_name = req.body.model_name;
        var manufacturer = req.body.manufacturer;

        if( (name && id && warrantyserial && model_id && model_name && manufacturer) ===undefined ){
            res.json({"message":"Transaction failed, missing required parameter"})
        }else{
           
            blockchain.createNewCustomerContract(req.body).then(function(hash,err){
     
                response["Tx Hash"] = hash;

                res.json(response);
                
            }); 
        }
    }  
});

app.get('/get-warranties', function(req, res) {

    var contract_address = req.query.contract_address;

    if (!contract_address){
        res.json({"message":"Transaction failed, missing required query parameter"})
    }else{
        blockchain.getWarranties(contract_address).then(function(count){
            console.log(count)
            res.json(count)
        })
    }
    
})



app.listen(port);
console.log('Magic happens on port ' + port);

// if (typeof web3 !== 'undefined') {
//     web3 = new Web3(web3.currentProvider);
//   } else {
//     // set the provider you want from Web3.providers
//     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//   }


//let CPS = new web3.eth.Contract(abi);

//console.log(CPS);