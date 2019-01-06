'use strict';

module.exports = function(Resourcecategory) {

    //  disable delete end point
  Resourcecategory.disableRemoteMethod("deleteById", true);
  Resourcecategory.disableRemoteMethod("destroyById", true);
  Resourcecategory.disableRemoteMethod("removeById", true);

};
