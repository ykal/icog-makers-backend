'use strict';

module.exports = function(Region) {

    //  disable delete end point
  Region.disableRemoteMethod("deleteById", true);
  Region.disableRemoteMethod("destroyById", true);
  Region.disableRemoteMethod("removeById", true);

};
