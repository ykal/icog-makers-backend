/* kal */

module.exports = function(app) {

    const { IcogRole, UserAccount } = app.models;
    
    IcogRole.registerResolver('admin', function(role, context, cb) {
        console.log(context.accessToken);
        if (!context.accessToken) {
            cb(null, false);
        } else {
            UserAccount.findById(context.accessToken.userId, {include: "role"}, function (error, user) {
                if (error || !user || user.toJSON().role.name !== "admin"){
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            });
        }
    });

    IcogRole.registerResolver('mgt', function(role, context, cb) {
        if (!context.accessToken) {
            cb(null, false);
        } else {
            UserAccount.findById(context.accessToken.userId, {include: "role"}, function (error, user) {
                if (error || !user || user.toJSON().role.name !== "solve-it-mgt"){
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            });
        }
    });

    IcogRole.registerResolver('team', function(role, context, cb) {
        if (!context.accessToken) {
            cb(null, false);
        } else {
            UserAccount.findById(context.accessToken.userId, {include: "role"}, function (error, user) {
                if (error || !user || user.toJSON().role.name !== "solve-it-team"){
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            });
        }
    });

    IcogRole.registerResolver('participant', function(role, context, cb) {
        if (!context.accessToken) {
            cb(null, false);
        } else {
            UserAccount.findById(context.accessToken.userId, {include: "role"}, function (error, user) {
                if (error || !user || user.toJSON().role.name !== "solve-it-participants"){
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            });
        }
    });
};