'use strict';

module.exports = function(Competitionwinner) {

  //  disable delete end point
  Competitionwinner.disableRemoteMethod("deleteById", true);
  Competitionwinner.disableRemoteMethod("destroyById", true);
  Competitionwinner.disableRemoteMethod("removeById", true);

};
