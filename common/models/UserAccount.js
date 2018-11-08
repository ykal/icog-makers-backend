'use strict';
var Excel = require('exceljs');
let STATUS = require('../configs/config');
const uniqueid = require('uniqid');

module.exports = function(Useraccount) {

    // validate uniqueness of username & phoneNumber fields
    Useraccount.validatesUniquenessOf("phoneNumber", { message: "Phone Number is not unique." });
    Useraccount.validatesUniquenessOf("username", { message: "User name is not unique." });

    Useraccount.observe('after save', function(ctx, next) {

      if(ctx.instance !== undefined) {
        let { emailConfirmationId } = Useraccount.app.models;
        let { Email } = Useraccount.app.models;
        let cId = uniqueid();
        let email = ctx.instance.email;
        let userId = ctx.instance.id;
        let html = `<p>Hello <b>${ctx.instance.firstName}</b>, Welcome to SolveIT competition. Pleace confirm your email address by following the link below. </p>
                    <a href="http://localhost:4200/confirm/${userId}-${cId}">confirmation link</a>`
        emailConfirmationId.create({cId: cId, userId: userId}, function(err, data) {
          if (err) {
            next(err);
            return;
          }
          Email.send({
            to: email,
            from: 'kal.a.yitbarek@gmail.com',
            subject: 'Welcome to SolveIT',
            html: html
          }, function(err, mail) {
            if (err) {
              console.log("Error while sending email ", err);
              next(err);
            }
            console.log('email sent!');
            next();
          });
        })
      } else {
        console.log("update");
      }
    });

    // check if email is verified before login
    Useraccount.beforeRemote('login', function (ctx, unused, next) {
      console.log('loging in');
      let email = ctx.args.credentials.email;
      let pass = ctx.args.credentials.password;
      Useraccount.findOne({where: {email: email}}, function(err, data) {
        console.log(data);
        if (err) {
          next(err);
        } else {
          if (data.emailVerified) {
            next();
          } else {
            let error = new Error();
            next(error);
          }
        }
      });
    });

    // register SolveIT managment members
    Useraccount.registerSolveItMgt = async(firstName, middleName, lastName, email, password, phoneNumber, username) => {
        let { IcogRole } = Useraccount.app.models;
        let userRole = await IcogRole.findOne({ where: { name: "solve-it-mgt" } });
        let user = {
            "firstName": firstName,
            "middleName": middleName,
            "lastName": lastName,
            "phoneNumber": phoneNumber,
            "password": password,
            "email": email,
            "username": username,
            "roleId": userRole.id,
            "created": new Date().toISOString()
        };

        user = await Useraccount.create(user);

        return user;

    }

    // register SolveIT teams
    Useraccount.registerSolveItTeam = async(firstName, middleName, lastName, email, password, phoneNumber, username) => {
        let { IcogRole } = Useraccount.app.models;
        let userRole = await IcogRole.findOne({ where: { name: "solve-it-team" } });

        let user = {
            "firstName": firstName,
            "middleName": middleName,
            "lastName": lastName,
            "phoneNumber": phoneNumber,
            "password": password,
            "email": email,
            "username": username,
            "roleId": userRole.id,
            "created": new Date().toISOString()
        };

        user = await Useraccount.create(user);

        return user;
    }

    // register SolveIT participants
    Useraccount.registerParticipants = async(user) => {
        let { IcogRole } = Useraccount.app.models;
        let userRole = await IcogRole.findOne({ where: { name: "solve-it-participants" } });

        user["roleId"] = userRole.id;
        user["created"] = new Date().toISOString();

        user = await Useraccount.create(user);

        return user;
    }

    // activate registered user
    Useraccount.activateUser = async(userId) => {
        let user = await Useraccount.findOne({ where: { id: userId } });

        let updatedUser = await user.updateAttribute('status', STATUS[1]);
        return user;
    }

    // confirm email address
    Useraccount.confirmEmail = async(userId, cid, cb) => {
      let { emailConfirmationId } = Useraccount.app.models;
      let record = await emailConfirmationId.findOne({ where: {cId: cid}});
      if (record !== null && userId === record.userId) {
        Useraccount.updateAll({id: userId}, {emailVerified: true}, function(err, data) {
          if (err) {
            console.log("error");
          }
          cb(null, true);
        });
      } else {
        let err = new Error();
        cb(err);
      }
    }

    Useraccount.deactivateUser = async(userId) => {
        let user = await Useraccount.findOne({ where: { id: userId } });

        let updatedUser = await user.updateAttribute('status', STATUS[0]);
        return user;
    }

    Useraccount.searchUser = function(keyword, cb) {
      let pattern = new RegExp('.*'+ keyword+ '.*', "i"); /* case-insensitive RegExp search */
      if (keyword.trim() !== '') {
        let { IcogRole } = Useraccount.app.models;
        IcogRole.findOne({ where: { name: "solve-it-participants" } }, function(err, role) {
            Useraccount.find({ where: { and: [
                                              { roleId: role.id },
                                              { or: [
                                                      { email: { like: pattern } },
                                                      { firstName: { like: pattern } },
                                                      { middleName: { like: pattern } },
                                                      { lastName: { like: pattern } },
                                                      { username: { like: pattern } }
                                                    ]
                                              }
                                            ]
                                          }
                                        }, function(err, users) {
                cb(null, users);
            });
        });
      } else {
        cb(null, []);
      }
    }

    Useraccount.getUserListByRole = function(roleId, cb) {
        Useraccount.find({ where: { roleId: roleId } }, function(err, users) {
            cb(null, users);
        });
    }

    Useraccount.exportData = async(selectionOptions, res) => {
        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet("report");

        const { IcogRole } = Useraccount.app.models;
        const City = Useraccount.app.models.City;

        const role = await IcogRole.findOne({ where: { name: "solve-it-participants" } });

        var sex = selectionOptions.sex;
        var educationLevel = selectionOptions.educationLevel;
        var cities = [];
        var users = [];

        if (selectionOptions.selectedCity === 0) {
            cities = await City.find({include: 'region'});
        } else {
            let city = await City.find({where: {id: selectionOptions.selectedCity}, include: 'region'});
            cities.push(city);
        }
        sheet.columns = [
            { header: 'Region', key: 'region', width: 10},
            { header: 'City', key: 'city', width: 10 },
            { header: 'First Name', key: 'firstName', width: 10},
            { header: 'Last Name', key: 'lastName', width: 10},
            { header: 'Age', key: 'age', width: 10},
            { header: 'Sex', key: 'sex', width: 10 },
            { header: 'Phone Number', key: 'phoneNumber', width: 10}
        ];

        if (sex == 'both' && educationLevel == 'none') {
            for (const city of cities) {
                users = await Useraccount.find({where: {cityId: city.id}});
                for (const user of users) {
                    sheet.addRow({region: JSON.parse(JSON.stringify(city[0])).region.name, city: city[0].name, firstName: user.firstName, lastName: user.lastName, age: user.age, sex: user.sex, phoneNumber: user.phoneNumber});
                }
            }
        }else if(sex == 'both' || educationLevel == 'none') {
            if (sex == 'both') {
                for (const city of cities) {
                    users = await Useraccount.find({where: {cityId: city.id, educationLevel: educationLevel}});
                    for (const user of users) {
                        sheet.addRow({region: JSON.parse(JSON.stringify(city[0])).region.name, city: city[0].name, firstName: user.firstName, lastName: user.lastName, age: user.age, sex: user.sex, phoneNumber: user.phoneNumber});
                    }
                }
            }else {
                for (const city of cities) {
                    users = await Useraccount.find({where: {cityId: city.id, sex: sex}});
                    for (const user of users) {
                        sheet.addRow({region: JSON.parse(JSON.stringify(city[0])).region.name, city: city[0].name, firstName: user.firstName, lastName: user.lastName, age: user.age, sex: user.sex, phoneNumber: user.phoneNumber});
                    }
                }
            }
        }else {
            for (const city of cities) {
                users = await Useraccount.find({where: {cityId: city.id, educationLevel: educationLevel, sex: sex}});
                for (const user of users) {
                    sheet.addRow({region: JSON.parse(JSON.stringify(city[0])).region.name, city: city[0].name, firstName: user.firstName, lastName: user.lastName, age: user.age, sex: user.sex, phoneNumber: user.phoneNumber});
                }
            }
        }

        await sendWorkbook(workbook, res);
    }

    async function sendWorkbook(workbook, response) {
        var fileName = 'ExportedData.xlsx';

        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        await workbook.xlsx.write(response);

		response.end();
    }

	Useraccount.remoteMethod("exportData", {
	    description: "return data.",
	    accepts: [
		  { arg: "selectionOptions", type: "object", required: true },
		  {arg: 'res', type: 'object', 'http': {source: 'res'}}
	    ],
	    http: {
	      verb: "post",
	      path: "/exportData"
	    },
	    returns: {
	      type: "object",
	      root: true
	    }
	});

    Useraccount.remoteMethod(
        'searchUser', {
            http: { path: '/search/:keyword', verb: 'get' },
            accepts: { arg: 'keyword', type: 'string' },
            returns: { arg: 'Result', type: 'Object' }
        }
    );

    Useraccount.remoteMethod(
        'getUserListByRole', {
            http: { path: '/role/:roleId/users', verb: 'get' },
            accepts: { arg: 'roleId', type: 'string' },
            returns: { arg: 'Result', type: 'Object' }
        }
    );

    Useraccount.remoteMethod("registerSolveItMgt", {
        desctiption: "Register SolveIT managment users",
        accepts: [
            { arg: "firstName", type: "string", required: true },
            { arg: "middleName", type: "string", required: true },
            { arg: "lastName", type: "string", required: true },
            { arg: "email", type: "string", required: true },
            { arg: "password", type: "string", required: true },
            { arg: "phoneNumber", type: "string", required: true },
            { arg: "username", type: "string", require: true }
        ],
        http: {
            verb: "post",
            path: "/register-solveit-mgt",
        },
        returns: {
            type: "object",
            root: true
        }
    });

    Useraccount.remoteMethod("registerSolveItTeam", {
        desctiption: "Register SolveIT teams.",
        accepts: [
            { arg: "firstName", type: "string", required: true },
            { arg: "middleName", type: "string", required: true },
            { arg: "lastName", type: "string", required: true },
            { arg: "email", type: "string", required: true },
            { arg: "password", type: "string", required: true },
            { arg: "phoneNumber", type: "string", required: true },
            { arg: "username", type: "string", require: true }
        ],
        http: {
            verb: "post",
            path: "/register-solveit-team",
        },
        returns: {
            type: "object",
            root: true
        }
    });

    Useraccount.remoteMethod("registerParticipants", {
        desctiption: "Register SolveIT teams.",
        accepts: [
            { arg: "user", type: "object", required: true }
        ],
        http: {
            verb: "post",
            path: "/register-participants",
        },
        returns: {
            type: "object",
            root: true
        }
    });

    Useraccount.remoteMethod("activateUser", {
        desctiption: "Activate registered user",
        accepts: { arg: "userId", type: "string", require: true },
        http: {
            verb: "post",
            path: "/activate-user"
        },
        returns: {
            type: "object",
            root: true
        }
    });

    Useraccount.remoteMethod("deactivateUser", {
        description: "Deactivate registered user",
        accepts: { arg: "userId", type: "string", require: true },
        http: {
            verb: "post",
            path: "/deactivate-user"
        },
        returns: {
            type: "object",
            root: true
        }
    });

    Useraccount.remoteMethod("confirmEmail", {
      description: "Confirm email address",
      accepts: [
        { arg: "userId", type: "string", require: true },
        { arg: "cid", type: "string", require: true}
      ],
      http: {
        verb: "post",
        path: "/confirmEmail"
      },
      returns: {
        type: "boolean",
        arg: "result"
      }
    });
};
