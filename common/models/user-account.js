'use strict';
let STATUS = require('../configs/config');

module.exports = function(Useraccount) {

  // validate uniqueness phoneNumber field
  Useraccount.validatesUniquenessOf("phoneNumber", {message: "Phone Number is not unique."});

  // register SolveIT managment members
  Useraccount.registerSolveItMgt = async (firstName, middleName, lastName, email, password, phoneNumber) => {
    let { IcogRole } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({where: {name: "solve-it-mgt"}});
    let user = {
      "firstName": firstName,
      "middleName": middleName,
      "lastName": lastName,
      "phoneNumber": phoneNumber,
      "password": password,
      "email": email,
      "roleId": userRole.id,
      "created": new Date().toISOString()
    };

    user = await Useraccount.create(user);

    return user;
  }

  // register SolveIT teams
  Useraccount.registerSolveItTeam = async (firstName, middleName, lastName, email, password, phoneNumber) => {
    let { IcogRole } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({ where : { name: "solve-it-team" } });

    let user = {
      "firstName": firstName,
      "middleName": middleName,
      "lastName": lastName,
      "phoneNumber": phoneNumber,
      "password": password,
      "email": email,
      "roleId": userRole.id,
      "created": new Date().toISOString()
    };

    user = await Useraccount.create(user);

    return user;
  }

  // register SolveIT participants
  Useraccount.registerParticipants = async (user) => {
    let { IcogRole } = Useraccount.app.models;
    let userRole = await IcogRole.findOne({ where : { name: "solve-it-participants" } });

    user["roleId"] = userRole.id;
    user["created"] = new Date().toISOString();

    user = await Useraccount.create(user);

    return user;
  }

  // activate registered user
  Useraccount.activateUser = async (userId) => {
    let user = await Useraccount.findOne({ where: { id: userId } });

    let updatedUser = await user.updateAttribute('status', STATUS[1]);
    return user;
  }

  Useraccount.deactivateUser = async (userId) => {
    let user = await Useraccount.findOne({ where: { id: userId } });

    let updatedUser = await user.updateAttribute('status', STATUS[0]);
    return user;
  }

  Useraccount.remoteMethod("registerSolveItMgt", {
    desctiption: "Register SolveIT managment users",
    accepts: [
      {arg: "firstName", type: "string", required: true},
      {arg: "middleName", type: "string", required: true},
      {arg: "lastName", type: "string", required: true},
      {arg: "email", type: "string", required: true},
      {arg: "password", type: "string", required: true},
      {arg: "phoneNumber", type: "string", required: true}
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
      {arg: "firstName", type: "string", required: true},
      {arg: "middleName", type: "string", required: true},
      {arg: "lastName", type: "string", required: true},
      {arg: "email", type: "string", required: true},
      {arg: "password", type: "string", required: true},
      {arg: "phoneNumber", type: "string", required: true}
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
      {arg: "user", type: "object", required: true}
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
    accepts: {arg: "userId", type: "string", require: true},
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
    desctiption: "Deactivate registered user",
    accepts: {arg: "userId", type: "string", require: true},
    http: {
      verb: "post",
      path: "/deactivate-user"
    },
    returns: {
      type: "object",
      root: true
    }
  });

};
