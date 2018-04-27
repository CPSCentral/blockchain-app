//Write your own contracts here. Currently compiles using solc v0.4.15+commit.bbb8e64f.
pragma solidity ^0.4.18;
contract CPS {

    struct CYACustomer {
      bytes name;
      uint cya_id;

    }


    struct Warranty {
        uint cya_warrantyserial;
        uint model_id;
        bytes model_name;
        bytes model_manufacturer;
    }

    CYACustomer public cya_customer;
    Warranty[] warranty_array;

    function createCustomer(bytes name, uint id) public returns(bytes){

       cya_customer = CYACustomer(name,id);
 

    }

    function getCustomer() public returns (uint, bytes){
      return (cya_customer.cya_id, cya_customer.name);
    }

    function addWarranty(uint cya_warrantyserial, uint model_id, bytes model_name, bytes manufacturer) public returns(uint) {
        warranty_array.length++;
         warranty_array[ warranty_array.length-1].cya_warrantyserial = cya_warrantyserial;
        warranty_array[ warranty_array.length-1].model_name = model_name;
         warranty_array[ warranty_array.length-1].model_manufacturer = manufacturer;
        return warranty_array.length;
    }

    function getWarrantyCount() public constant returns(uint) {
        return warranty_array.length;
    }

    function getWarrantyByArrayIndex(uint index) public constant returns(uint, bytes, bytes) {

        return (warranty_array[index].cya_warrantyserial, warranty_array[index].model_name, warranty_array[index].model_manufacturer);
    }
    
    function getWarrantyBySerial(uint serial) public constant returns(uint, bytes, bytes) {


        for (uint i=0;i<warranty_array.length;i++){
          if(warranty_array[i].cya_warrantyserial==serial){
              return (warranty_array[i].cya_warrantyserial,warranty_array[i].model_name,warranty_array[i].model_manufacturer);
          }
        }

        return (0,"0", "0");
        
    }

}