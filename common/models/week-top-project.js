'use strict';

module.exports = function(Weektopproject) {

    //  disable delete end point
  Weektopproject.disableRemoteMethod("deleteById", true);
  Weektopproject.disableRemoteMethod("destroyById", true);
  Weektopproject.disableRemoteMethod("removeById", true);

};
