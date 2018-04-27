var express    = require('express');   
var app        = express(); 
var port = process.env.PORT || 8080;      
var router = express.Router();    
var blockchain = require('./web3');

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.get('/new-warranty', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

blockchain.createNewCustomerContract();

app.use('/api', router);
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