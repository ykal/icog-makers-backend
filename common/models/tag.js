'use strict';

module.exports = function(Tag) {

    //  disable delete end point
  Tag.disableRemoteMethod("deleteById", true);
  Tag.disableRemoteMethod("destroyById", true);
  Tag.disableRemoteMethod("removeById", true);

};
