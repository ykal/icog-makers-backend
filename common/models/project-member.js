'use strict';

module.exports = function(Projectmember) {

    Projectmember.removeMember = function(member, cb) {
        Projectmember.destroyAll({userId: member.userId, projectId: member.projectId}, (error, data) => {
            if (error) cb(new Error('Error while fetching project member'));
            return cb(null, data);
        });
    }

    Projectmember.remoteMethod('removeMember', {
        description: "Remove project member",
        accepts: {
          arg: "member",
          type: "object",
          require: true
        },
        http: {
          verb: "post",
          path: "/removeMember"
        },
        returns: {
          type: "object",
          root: true
        }
    });

};
