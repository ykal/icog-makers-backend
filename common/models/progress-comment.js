'use strict';

module.exports = function(Progresscomment) {

    //  disable delete end point
    Progresscomment.disableRemoteMethod("deleteById", true);
    Progresscomment.disableRemoteMethod("destroyById", true);
    Progresscomment.disableRemoteMethod("removeById", true);

};
