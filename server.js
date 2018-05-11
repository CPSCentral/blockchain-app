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

function checkParams(req, firstTime){
    var contract_address = req.body.contract_tx_hash;
    var warrantyserial = req.body.cya_warrantyserial;
    var price = req.body.price;
    var items = req.body.items;
    var netType = req.body.netType;

    var email=false;
    var id=false;

    if (firstTime){
        email=req.body.email;
        id=req.body.id
    }else{
        email = true;
        id =true ;
    }
   // console.log(email)
    if( ( warrantyserial && netType && items && price && email && id) ===undefined ){
        return true;
    }else{return false}

}

app.post('/new-warranty', function(req, res) {
    
    console.log("Received request for new warranty...!")
    console.log(req.body)
    var response = {"repeating customer":false
                    }

    // First check if first time customer by looking for contract hash in request
    if (req.body.contract_tx_hash){
        // Repeating customer
        console.log("Repeating customer!")
        response["repeating customer"] = true;


        if(checkParams(req, firstTime=false) ){
            res.json({"message":"Transaction failed, missing required parameter"})
        }else{

            // Now update his existing contract
            blockchain.addNewWarranty( req.body).then(function(hash){
                response["Contract_Address"]=hash;
                res.json(response);
            }) 
        }

    }else{
        // New customer - create a new contract
        console.log("New customer!")

      if(checkParams(req, firstTime=true) ){
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

    var contract_address = req.body.contract_tx_hash;

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