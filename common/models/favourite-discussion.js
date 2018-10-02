'use strict';

module.exports = function(Favouritediscussion) {

  Favouritediscussion.removeFromFavorite =  async (userId, discussionId) => {
    let res = Favouritediscussion.destroyAll({userId: userId, discussionId: discussionId});
    return res;
  }

  Favouritediscussion.observe('before save',function (ctx, next) {
    let userId = ctx.instance.userId;
    let discussionId = ctx.instance.discussionId;
    Favouritediscussion.find({where: {and: [{userId: userId}, {discussionId: discussionId}]}},
                        function (err, existingFav) {
                          if (existingFav.length > 0) {
                            console.log("inside if ")
                            var error = new Error();
                            error.status = 422;
                            error.message = "Combination of user and discussion already existed.";
                            next(error);
                          } else {
                            console.log("inside else ")
                           next();
                          }
                        });

  });

  Favouritediscussion.remoteMethod('removeFromFavorite', {
    accepts: [
      {arg: "userId", type: "string", required: true},
      {arg: "discussionId", type: "string", required: true},
    ],
    http: {
      verb: "post",
      path: "/removeFromFavorite"
    },
    returns: {
      arg: "result",
      type: "object"
    }
  })

};
