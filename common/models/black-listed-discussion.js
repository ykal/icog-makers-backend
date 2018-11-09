'use strict';

module.exports = function(Blacklisteddiscussion) {

  Blacklisteddiscussion.removeFromBlackList =  async (discussionId) => {
    let res = Blacklisteddiscussion.destroyAll({discussionId: discussionId});
    return res;
  }

  Blacklisteddiscussion.remoteMethod('removeFromBlackList', {
    accepts: [
      {arg: "discussionId", type: "string", required: true},
    ],
    http: {
      verb: "post",
      path: "/removeFromBlackList"
    },
    returns: {
      arg: "result",
      type: "object"
    }
  })

};
