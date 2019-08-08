'use strict';

module.exports = function(Solveitforum) {
  Solveitforum.getBySlung = function(slung, cb) {
    Solveitforum.find({where: {slung: slung}}, function(err, forum) {
      cb(null, forum);
    });
  };

  Solveitforum.getForumList = function(cb) {
    var count = 0;
    var forumList = [];
    const Category = Solveitforum.app.models.forumCategory;
    Category.find(function(err, categories) {
      if (categories.length == 0) {
        cb(null, forumList);
      } else {
        for (const category of categories) {
          Solveitforum.find(
            {
              where: {categoryId: category.id},
              order: 'discussionCount DESC',
              limit: 4,
            },
            function(err, forums) {
              forumList = forumList.concat(forums);
              count += 1;
              if (count == categories.length) {
                cb(null, forumList);
              }
            }
          );
        }
      }
    });
  };

  Solveitforum.remoteMethod('getForumList', {
    http: {path: '/forumList', verb: 'get'},
    accepts: [],
    returns: {arg: 'Result', type: 'Object'},
  });

  Solveitforum.remoteMethod('getBySlung', {
    http: {path: '/:slung/forum', verb: 'get'},
    accepts: {arg: 'slung', type: 'string'},
    returns: {arg: 'Result', type: 'Object'},
  });
};
