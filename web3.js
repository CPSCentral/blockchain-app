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

// Contract object
const contract = web3.eth.contract(abi);

console.log(web3.eth.coinbase)

module.exports = { createNewCustomerContract: function (){

    console.log(web3.eth.coinbase)
    // Deploy contract instance
    const contractInstance = contract.new({
        data: '0x' + bytecode,
        from: web3.eth.coinbase,
        gas: 3000000
    }, (err, res) => {
        if (err) {
            console.log(err);
            return false;
        }

        // Log the tx, you can explore status with eth.getTransaction()
        console.log(res.transactionHash);

        // If we have an address property, the contract was deployed
        if (res.address) {
            console.log('Contract address: ' + res.address);
            // Let's test the deployed contract
          //  testContract(res.address);
          return res.transactionHash
        }
    });

}
}