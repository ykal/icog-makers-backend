'use strict';

module.exports = function(Solveitproject) {

    //  disable delete end point
  Solveitproject.disableRemoteMethod("deleteById", true);
  Solveitproject.disableRemoteMethod("destroyById", true);
  Solveitproject.disableRemoteMethod("removeById", true);

};
