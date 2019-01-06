'use strict';

module.exports = function(Progressreport) {

    //  disable delete end point
  Progressreport.disableRemoteMethod("deleteById", true);
  Progressreport.disableRemoteMethod("destroyById", true);
  Progressreport.disableRemoteMethod("removeById", true);

};
