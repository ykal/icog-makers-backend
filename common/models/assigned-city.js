'use strict';

module.exports = function(Assignedcity) {

    Assignedcity.assign = function (data, cb) {
        Assignedcity.find({were: {userId: data.userId}}, (error, res) => {
            if (error) cb(new Error('Error while assigning cities.'));
            if (res.length > 0) {
                Assignedcity.updateAll({id: res[0].id}, {cities: data.cities}, (err, res1) => {
                    if (err) cb(new Error('Error while updating assignment.')); 
                    cb(null, res1)
                });
            } else {
                Assignedcity.create(data, (err, res2) => {
                    if (err) cb(new Error('Error while updating assignment.')); 
                    cb(null, res2)
                });
            }
        });
    }

    Assignedcity.remoteMethod("assign", {
        description: "Assign user to cities",
        accepts: {
          arg: "data",
          type: "object",
          require: true
        },
        http: {
          verb: "post",
          path: "/assign"
        },
        returns: {
          type: "object",
          root: true
        }
    })

};
