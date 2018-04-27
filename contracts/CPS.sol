//Write your own contracts here. Currently compiles using solc v0.4.15+commit.bbb8e64f.
pragma solidity ^0.4.18;
contract CPS {

    struct CYACustomer {
      string name;
      Warranty[] warranty_array;
      uint cya_id;
    }

    struct Model {
      uint cya_id;
      string name;
      string manufacturer;
    }

    struct Warranty {
        uint cya_warrantyserial;
        Model model;
    }

    CYACustomer cya_customer;

    function createCustomer(string name, uint id) public returns(string){

      CYACustomer memory customer = CYACustomer({
          cya_id: id,
          name: name,
          warranty_array: new Warranty[](0)
      });

      customer = cya_customer;

    }

    function getCustomer() public returns (uint, string, uint){
      return (cya_customer.cya_id, cya_customer.name, cya_customer.warranty_array.length);
    }
    
    function addWarranty(uint cya_warrantyserial, uint cya_id, string modelName, string manufacturer) public returns(uint) {
        cya_customer.warranty_array.length++;
         cya_customer.warranty_array[ cya_customer.warranty_array.length-1].cya_warrantyserial = cya_warrantyserial;
         cya_customer.warranty_array[ cya_customer.warranty_array.length-1].model.name = modelName;
         cya_customer.warranty_array[ cya_customer.warranty_array.length-1].model.manufacturer = manufacturer;
        return cya_customer.warranty_array.length;
    }

    function getWarrantyCount() public constant returns(uint) {
        return cya_customer.warranty_array.length;
    }

    function getWarrantyByArrayIndex(uint index) public constant returns(uint, string, string) {

        return (cya_customer.warranty_array[index].cya_warrantyserial, cya_customer.warranty_array[index].model.name, cya_customer.warranty_array[index].model.manufacturer);
    }
    
    function getWarrantyBySerial(uint serial) public constant returns(uint, string, string) {


        for (uint i=0;i<cya_customer.warranty_array.length;i++){
          if(cya_customer.warranty_array[i].cya_warrantyserial==serial){
              return (cya_customer.warranty_array[i].cya_warrantyserial,cya_customer.warranty_array[i].model.name,cya_customer.warranty_array[i].model.manufacturer);
          }
        }

        return (0,"0", "0");
        
    }

}