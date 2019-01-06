'use strict';

module.exports = function(Icogrole) {

  //  disable delete end point
  Icogrole.disableRemoteMethod("deleteById", true);
  Icogrole.disableRemoteMethod("destroyById", true);
  Icogrole.disableRemoteMethod("removeById", true);

};
