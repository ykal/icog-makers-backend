'use strict';

module.exports = function(Event) {

  //  disable delete end point
  Event.disableRemoteMethod("deleteById", true);
  Event.disableRemoteMethod("destroyById", true);
  Event.disableRemoteMethod("removeById", true);

};
