'use strict';

module.exports = function(News) {


    //  disable delete end point
  News.disableRemoteMethod("deleteById", true);
  News.disableRemoteMethod("destroyById", true);
  News.disableRemoteMethod("removeById", true);
    

};
