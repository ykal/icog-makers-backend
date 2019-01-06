'use strict';

module.exports = function(Reply) {

    //  disable delete end point
  Reply.disableRemoteMethod("deleteById", true);
  Reply.disableRemoteMethod("destroyById", true);
  Reply.disableRemoteMethod("removeById", true);

};
