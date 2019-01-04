'use strict';
let url = require('../configs/urlConfig');

module.exports = function(Solveitdiscussioncomment) {

  Solveitdiscussioncomment.observe('after save', function(ctx, next) {
    let { Email, Solveitdiscussion, UserAccount } = Solveitdiscussioncomment.app.models;
    Solveitdiscussion.findOne({where: {id: ctx.instance.discussionId}, include: "user"}, function(err, data) {
      if (err) {
        const err = new Error();
        next(err);
      } else {
        const discussion = data.toJSON();
        const reciverEmail = discussion.user.email;
        const reciverFirstName = discussion.user.firstName;
        UserAccount.findOne({where: {id: ctx.instance.userId}}, function(err1, user) {
          if (err1) {
            const err1 = new Error();
            next(err1);
          } else {
            const commenter = discussion.user.username === user.username ? 'you' : user.username;
            const html = `<p>Hey <b>${reciverFirstName}</b>, <em>${commenter}</em> commented on your discussion.</p>
                         <a href="${url}/discussions/${discussion.slung}">check it here.</a>`;
            Email.send({
              to: reciverEmail,
              from: 'email@icog-labs.com',
              subject: 'New comment on your discussion',
              html: html
            }, function(err3, mail) {
              if (err3) {
                const err3 = new Error();
                next(err3);
              } else {
                next();
              }
            });
          }
        });
      }

    })
  });

};
