//Write your own contracts here. Currently compiles using solc v0.4.15+commit.bbb8e64f.
pragma solidity ^0.4.18;
contract CPS {

    struct CYACustomer {
      string name;
      uint cya_id;

    }


    struct Warranty {
        uint cya_warrantyserial;
        uint model_id;
        string model_name;
        string model_manufacturer;
    }

    CYACustomer public cya_customer;
    Warranty[] warranty_array;

    function createCustomer(string name, uint id) public {

       cya_customer = CYACustomer(name,id);

    }
    
    function getCustomer() public returns (uint, string) {
      return (cya_customer.cya_id, cya_customer.name);
    }
    
        function addWarranty(uint cya_warrantyserial, uint model_id, string model_name, string manufacturer) public returns(uint) {
        warranty_array.length++;
         warranty_array[ warranty_array.length-1].cya_warrantyserial = cya_warrantyserial;
        warranty_array[ warranty_array.length-1].model_name = model_name;
         warranty_array[ warranty_array.length-1].model_manufacturer = manufacturer;
        return warranty_array.length;
    }
    
    function getWarrantyCount() public constant returns(uint) {
        return warranty_array.length;
    }
    
    function getWarrantyByArrayIndex(uint index) public constant returns(uint, string, string) {

        return (warranty_array[index].cya_warrantyserial, warranty_array[index].model_name, warranty_array[index].model_manufacturer);
    }
    

    function getWarrantyBySerial(uint serial) public constant returns(uint, string, string) {


        for (uint i=0;i<warranty_array.length;i++){
          if(warranty_array[i].cya_warrantyserial==serial){
              return (warranty_array[i].cya_warrantyserial,warranty_array[i].model_name,warranty_array[i].model_manufacturer);
          }
        }

        return (0,"0", "0");
        
    }
}