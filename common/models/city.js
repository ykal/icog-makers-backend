'use strict';

module.exports = function(City) {
  
  //  disable delete end point
  City.disableRemoteMethod("deleteById", true);
  City.disableRemoteMethod("destroyById", true);
  City.disableRemoteMethod("removeById", true);

};
