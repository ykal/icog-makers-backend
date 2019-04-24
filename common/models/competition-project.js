'use strict';

module.exports = function(Competitionproject) {
  //  disable delete end point
  Competitionproject.disableRemoteMethod('deleteById', true);
  Competitionproject.disableRemoteMethod('destroyById', true);
  Competitionproject.disableRemoteMethod('removeById', true);

  Competitionproject.enroll = function(
    competitionId,
    projectId,
    questionnaireAnswers,
    cb
  ) {
    const temp = {competitionId, projectId, questionnaireAnswers};
    Competitionproject.findOrCreate(
      {where: {and: [{competitionId: competitionId}, {projectId: projectId}]}},
      temp,
      (error, response) => {
        if (error) cb(error);
        cb(null, response);
      }
    );
  };

  Competitionproject.remoteMethod('enroll', {
    description: 'Enroll project to competition.',
    accepts: [
      {
        arg: 'competitionId',
        type: 'string',
        require: true,
      },
      {
        arg: 'projectId',
        type: 'string',
        require: true,
      },
      {
        arg: 'questionnaireAnswers',
        type: 'object',
        require: true,
      },
    ],
    http: {
      verb: 'post',
      path: '/enroll',
    },
    returns: {
      type: 'object',
      root: true,
    },
  });
};
