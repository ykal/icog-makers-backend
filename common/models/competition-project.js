'use strict';

module.exports = function(Competitionproject) {

  //  disable delete end point
  Competitionproject.disableRemoteMethod("deleteById", true);
  Competitionproject.disableRemoteMethod("destroyById", true);
  Competitionproject.disableRemoteMethod("removeById", true);

};
