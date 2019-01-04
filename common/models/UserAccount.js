"use strict";
var Excel = require("exceljs");
let STATUS = require("../configs/config");
let url = require("../configs/urlConfig");
const uniqueid = require("uniqid");

module.exports = function (Useraccount) {

  Useraccount.observe("after save", function (ctx, next) {
    if (ctx.instance !== undefined && !ctx.instance.emailVerified) {
      let {
        emailConfirmationId
      } = Useraccount.app.models;
      let {
        Email
      } = Useraccount.app.models;
      let cId = uniqueid();
      let email = ctx.instance.email;
      let userId = ctx.instance.id;
      let html = `<p>Hello <b>${
        ctx.instance.firstName
      }</b>, Welcome to SolveIT competition. Pleace confirm your email address by following the link below. </p>
                    <a href="${url}/confirm/${userId}-${cId}">confirmation link</a>`;
      emailConfirmationId.create({
        cId: cId,
        userId: userId
      }, function (
        err,
        data
      ) {
        if (err) {
          next(err);
          return;
        }
        Email.send({
            to: email,
            from: "kal.a.yitbarek@gmail.com",
            subject: "Welcome to SolveIT",
            html: html
          },
          function (err, mail) {
            if (err) {
              console.log("Error while sending email ", err);
              next(err);
            }
            console.log("email sent!");
            next();
          }
        );
      });
    } else {
      next();
    }
  });

  // check password  request change is correct
  Useraccount.changePassword = function (key, cb) {
    let {
      forgotPasswordRequest
    } = Useraccount.app.models;
    console.log(key);
    const ids = key.split(",");
    const cid = ids[1];
    console.log(cid)
    forgotPasswordRequest.findOne({
      where: {
        id: cid
      }
    }, function (err, data) {
      if (err) {
        cb(new Error('Error while checking request'));
        return;
      }

      if (data && !data.inactive && data.userId === ids[0]) {
        forgotPasswordRequest.updateAll({
          id: ids[1]
        }, {
          inactive: true
        }, function (err, response) {
          console.log("update", response);
          if (err) {
            console.log("error while updating");
            cb(err);
            return;
          }
          cb(null, true);
        })
      } else {
        cb(null, false);
      }
    })
  }

  Useraccount.remoteMethod("changePassword", {
    desctiption: "request password change",
    accepts: {
      arg: "key",
      type: "string",
      require: true
    },
    http: {
      verb: "post",
      path: "/change-password"
    },
    returns: {
      type: "object",
      root: true,
      arg: "success"
    }
  });

  // check if email is verified before login
  Useraccount.beforeRemote("login", function (ctx, unused, next) {
    let email = ctx.args.credentials.email;
    let pass = ctx.args.credentials.password;
    Useraccount.findOne({
      where: {
        email: email
      }
    }, function (err, data) {
      if (err) {
        next(err);
      } else if (data !== null) {
        if (data.emailVerified) {
          next();
        } else {
          let error = new Error();
          next(error);
        }
      } else {
        let notForundError = new Error("User not found");
        next(notForundError);
      }
    });
  });

  // register SolveIT managment members
  Useraccount.registerSolveItMgt = async (
    firstName,
    middleName,
    lastName,
    email,
    password,
    phoneNumber,
    username
  ) => {
    let {
      IcogRole
    } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({
      where: {
        name: "solve-it-mgt"
      }
    });
    let user = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      password: password,
      email: email,
      username: username,
      roleId: userRole.id,
      created: new Date().toISOString()
    };

    user = await Useraccount.create(user);

    return user;
  };

  // register SolveIT teams
  Useraccount.registerSolveItTeam = async (
    firstName,
    middleName,
    lastName,
    email,
    password,
    phoneNumber,
    username
  ) => {
    let {
      IcogRole
    } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({
      where: {
        name: "solve-it-team"
      }
    });

    let user = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      password: password,
      email: email,
      username: username,
      roleId: userRole.id,
      created: new Date().toISOString()
    };

    user = await Useraccount.create(user);

    return user;
  };

  // register SolveIT participants
  Useraccount.registerParticipants = async user => {
    let {
      IcogRole
    } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({
      where: {
        name: "solve-it-participants"
      }
    });

    user["roleId"] = userRole.id;
    user["created"] = new Date().toISOString();

    user = await Useraccount.create(user);

    return user;
  };

  // activate registered user
  Useraccount.activateUser = async userId => {
    let user = await Useraccount.findOne({
      where: {
        id: userId
      }
    });

    let updatedUser = await user.updateAttribute("status", STATUS[1]);
    return user;
  };

  // confirm email address
  Useraccount.confirmEmail = function (userId, cid, cb) {
    let {
      emailConfirmationId
    } = Useraccount.app.models;
    emailConfirmationId.findOne({
      where: {
        cId: cid
      }
    }, function (err, record) {
      if (record !== null && userId === record.userId) {
        console.log("record ", record);
        Useraccount.updateAll({
          id: userId
        }, {
          emailVerified: true
        }, function (
          err,
          data
        ) {
          if (err) {
            console.log("error");
            cb(err);
            return;
          } else {
            console.log("updated ", data);
            cb(null, true);
            return;
          }
          console.log("after updated")
        });
      } else {
        console.log("final error");
        let err = new Error();
        cb(err);
        return;
      }
    });

  };

  Useraccount.deactivateUser = async userId => {
    let user = await Useraccount.findOne({
      where: {
        id: userId
      }
    });

    let updatedUser = await user.updateAttribute("status", STATUS[0]);
    return user;
  };

  // request password change
  Useraccount.requestPasswordChange = function (email, cb) {
    var pattern = new RegExp('.*' + email + '.*', "i");
    Useraccount.findOne({
      where: {
        email: {
          like: pattern
        }
      }
    }, function (err, data) {
      if (err) {
        cb(new Error("Error while searching user"));
      } else {
        if (data !== null) {
          let {
            forgotPasswordRequest
          } = Useraccount.app.models;
          const requestId = uniqueid();
          forgotPasswordRequest.create({
            id: requestId,
            userId: data.id
          }, function (err, res) {
            if (err) {
              cb(new Error("Error while creating forgot password request recored."), {
                sucess: false,
                error: 'recored'
              })
            } else {
              //  Email
              let {
                Email
              } = Useraccount.app.models;
              let email = data.email;
              let userId = data.id;
              let html = `<p> <b>${
                data.firstName
              }</b>, You have request to change your account password. Please follow the given link.</p>
                            <a href="${url}/change-password/${userId}-${requestId}">password change confirmation link.</a>`;

              Email.send({
                  to: email,
                  from: "kal.a.yitbarek@gmail.com",
                  subject: "Confirmation for password change",
                  html: html
                },
                function (err, mail) {
                  if (err) {
                    console.log("Error while sending email ", err);
                    cb(new Error("Error while sending email."), {
                      sucess: false,
                      error: 'email'
                    });
                  }
                  console.log("email sent!");
                  cb(null, {
                    sucess: true,
                    error: null
                  });
                }
              );
            }
          })
        } else {
          cb({
            sucess: false,
            error: 'notFound'
          })
        }
      }
    });
  }

  // reset password
  Useraccount.updatePassword = function (id, password, cb) {
    const buildError = (code, error) => {
      const err = new Error(error);
      err.statusCode = 400;
      err.code = code;
      return err;
    };

    Useraccount.findOne({
      where: {
        id: id
      }
    }, function (err, user) {
      if (err) {
        cb(buildError('INVALID_OPERATION', 'unable to find user.'));
        return;
      }
      user.updateAttribute('password', password, function (err, user) {
        if (err) {
          cb(buildError('INVALID_OPERATION', err));
          return;
        }

        // successful,
        // notify that everything is OK!
        cb(null, true);
      });

    })
  }

  // chek if email is unique
  Useraccount.isEmailUnique = function (email, cb) {
    Useraccount.findOne({
      where: {
        email: email
      }
    }, function (err, user) {
      if (err) {
        cb(err)
        return;
      }
      if (user === null) {
        cb(null, true);
        return
      } else {
        cb(null, false);
        return;
      }
    })
  }

  // search password
  Useraccount.searchUser = function (keyword, cb) {
    let pattern = new RegExp(
      ".*" + keyword + ".*",
      "i"
    ); /* case-insensitive RegExp search */
    if (keyword.trim() !== "") {
      let {
        IcogRole
      } = Useraccount.app.models;
      IcogRole.findOne({
        where: {
          name: "solve-it-participants"
        }
      }, function (
        err,
        role
      ) {
        Useraccount.find({
            where: {
              and: [{
                  roleId: role.id
                },
                {
                  or: [{
                      email: {
                        like: pattern
                      }
                    },
                    {
                      firstName: {
                        like: pattern
                      }
                    },
                    {
                      middleName: {
                        like: pattern
                      }
                    },
                    {
                      lastName: {
                        like: pattern
                      }
                    },
                    {
                      username: {
                        like: pattern
                      }
                    }
                  ]
                }
              ]
            }
          },
          function (err, users) {
            cb(null, users);
          }
        );
      });
    } else {
      cb(null, []);
    }
  };

  // get users by role
  Useraccount.getUserListByRole = function (roleId, cb) {
    Useraccount.find({
      where: {
        roleId: roleId
      }
    }, function (err, users) {
      cb(null, users);
    });
  };

  // export user data
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

    if (selectionOptions.selectedCity.toString() === "0") {
        cities = await City.find({include: 'region'});
    } else {
        let city = await City.findOne({where: {id: selectionOptions.selectedCity}, include: 'region'});
        cities.push(city);
    }
    sheet.columns = [
        { header: 'Region', key: 'region', width: 10},
        { header: 'City', key: 'city', width: 10 },
        { header: 'First Name', key: 'firstName', width: 10},
        { header: 'Last Name', key: 'lastName', width: 10},
        { header: 'Gender', key: 'sex', width: 10 },
        { header: 'Phone Number', key: 'phoneNumber', width: 10}
    ];

    if (sex == 'both' && educationLevel == 'none') {
        for (const city of cities) {
            users = await Useraccount.find({where: {cityId: city.id}});
            for (const user of users) {
                sheet.addRow({region: JSON.parse(JSON.stringify(city)).region.name, city: city.name, firstName: user.firstName, lastName: user.lastName, sex: user.gender, phoneNumber: user.phoneNumber});
            }
        }
    }else if(sex == 'both' || educationLevel == 'none') {
        if (sex == 'both') {
            for (const city of cities) {
                users = await Useraccount.find({where: {cityId: city.id, educationLevel: educationLevel}});
                for (const user of users) {
                    sheet.addRow({region: JSON.parse(JSON.stringify(city)).region.name, city: city.name, firstName: user.firstName, lastName: user.lastName, sex: user.gender, phoneNumber: user.phoneNumber});
                }
            }
        }else {
            for (const city of cities) {
                users = await Useraccount.find({where: {cityId: city.id, gender: sex}});
                for (const user of users) {
                    sheet.addRow({region: JSON.parse(JSON.stringify(city)).region.name, city: city.name, firstName: user.firstName, lastName: user.lastName, sex: user.gender, phoneNumber: user.phoneNumber});
                }
            }
        }
    }else {
        for (const city of cities) {
            users = await Useraccount.find({where: {cityId: city.id, educationLevel: educationLevel, gender: sex}});
            for (const user of users) {
                sheet.addRow({region: JSON.parse(JSON.stringify(city)).region.name, city: city.name, firstName: user.firstName, lastName: user.lastName, sex: user.gender, phoneNumber: user.phoneNumber});
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
    accepts: [{
        arg: "selectionOptions",
        type: "object",
        required: true
      },
      {
        arg: "res",
        type: "object",
        http: {
          source: "res"
        }
      }
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

  Useraccount.remoteMethod("searchUser", {
    http: {
      path: "/search/:keyword",
      verb: "get"
    },
    accepts: {
      arg: "keyword",
      type: "string"
    },
    returns: {
      arg: "Result",
      type: "Object"
    }
  });

  Useraccount.remoteMethod("getUserListByRole", {
    http: {
      path: "/role/:roleId/users",
      verb: "get"
    },
    accepts: {
      arg: "roleId",
      type: "string"
    },
    returns: {
      arg: "Result",
      type: "Object"
    }
  });

  Useraccount.remoteMethod("requestPasswordChange", {
    http: {
      path: "/request-password-change",
      verb: "post"
    },
    accepts: {
      arg: "email",
      type: "string",
      required: true
    },
    returns: {
      arg: "result",
      type: "object"
    }
  });

  Useraccount.remoteMethod("registerSolveItMgt", {
    desctiption: "Register SolveIT managment users",
    accepts: [{
        arg: "firstName",
        type: "string",
        required: true
      },
      {
        arg: "middleName",
        type: "string",
        required: true
      },
      {
        arg: "lastName",
        type: "string",
        required: true
      },
      {
        arg: "email",
        type: "string",
        required: true
      },
      {
        arg: "password",
        type: "string",
        required: true
      },
      {
        arg: "phoneNumber",
        type: "string",
        required: true
      },
      {
        arg: "username",
        type: "string",
        require: true
      }
    ],
    http: {
      verb: "post",
      path: "/register-solveit-mgt"
    },
    returns: {
      type: "object",
      root: true
    }
  });

  Useraccount.remoteMethod("registerSolveItTeam", {
    desctiption: "Register SolveIT teams.",
    accepts: [{
        arg: "firstName",
        type: "string",
        required: true
      },
      {
        arg: "middleName",
        type: "string",
        required: true
      },
      {
        arg: "lastName",
        type: "string",
        required: true
      },
      {
        arg: "email",
        type: "string",
        required: true
      },
      {
        arg: "password",
        type: "string",
        required: true
      },
      {
        arg: "phoneNumber",
        type: "string",
        required: true
      },
      {
        arg: "username",
        type: "string",
        require: true
      }
    ],
    http: {
      verb: "post",
      path: "/register-solveit-team"
    },
    returns: {
      type: "object",
      root: true
    }
  });

  Useraccount.remoteMethod("registerParticipants", {
    desctiption: "Register SolveIT teams.",
    accepts: [{
      arg: "user",
      type: "object",
      required: true
    }],
    http: {
      verb: "post",
      path: "/register-participants"
    },
    returns: {
      type: "object",
      root: true
    }
  });

  Useraccount.remoteMethod("updatePassword", {
    desctiption: "update user password.",
    accepts: [{
      arg: "id",
      type: "string",
      required: true
    }, {
      arg: "password",
      type: "string",
      required: true
    }],
    http: {
      verb: "post",
      path: "/update-password"
    },
    returns: {
      type: "object",
      root: true,
      arg: "success"
    }
  });

  Useraccount.remoteMethod("activateUser", {
    desctiption: "Activate registered user",
    accepts: {
      arg: "userId",
      type: "string",
      require: true
    },
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
    accepts: {
      arg: "userId",
      type: "string",
      require: true
    },
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
    accepts: [{
        arg: "userId",
        type: "string",
        require: true
      },
      {
        arg: "cid",
        type: "string",
        require: true
      }
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

  Useraccount.remoteMethod("isEmailUnique", {
    http: {
      path: "/is-email-unique",
      verb: "post"
    },
    accepts: {
      arg: "email",
      type: "string",
      require: true
    },
    returns: {
      arg: "result",
      type: "Object",
      root: true
    }
  });
};
