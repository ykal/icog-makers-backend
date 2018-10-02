'use strict';

module.exports = function(Blacklisteddiscussion) {

  Blacklisteddiscussion.removeFromBlackList =  async (userId, discussionId) => {
    let res = Blacklisteddiscussion.destroyAll({userId: userId, discussionId: discussionId});
    return res;
  }

  Blacklisteddiscussion.remoteMethod('removeFromBlackList', {
    accepts: [
      {arg: "userId", type: "string", required: true},
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
