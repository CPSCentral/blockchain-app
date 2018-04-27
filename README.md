# eth-node

# Installation:

- Clone repo to your local desktop: git clone https://github.com/CPSCentral/eth-node.git
- cd into eth-node
- Install packages: 
```npm install```

# Run on Blockchain

- Run a local blockchain network using:
```
  ./node_modules/.bin/testrpc --gasPrice 20000
  ```
  Change gas price as desired - in production, usually 2-4 Gwei (using 20000 above to ensure fast block creation)
  
  - Run server: ```node server.js```
