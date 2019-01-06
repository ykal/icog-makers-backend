'use strict';

module.exports = function(Resource) {

    //  disable delete end point
  Resource.disableRemoteMethod("deleteById", true);
  Resource.disableRemoteMethod("destroyById", true);
  Resource.disableRemoteMethod("removeById", true);

};
