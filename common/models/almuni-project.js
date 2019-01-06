'use strict';

module.exports = function(Almuniproject) {

      //  disable delete end point
  Almuniproject.disableRemoteMethod("deleteById", true);
  Almuniproject.disableRemoteMethod("destroyById", true);
  Almuniproject.disableRemoteMethod("removeById", true);

};
