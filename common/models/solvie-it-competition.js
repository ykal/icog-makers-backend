'use strict';

module.exports = function(Solvieitcompetition) {

	//  disable delete end point
	Solvieitcompetition.disableRemoteMethod("deleteById", true);
	Solvieitcompetition.disableRemoteMethod("destroyById", true);
	Solvieitcompetition.disableRemoteMethod("removeById", true);

	Solvieitcompetition.getActiveCompetition = function(cb){
		Solvieitcompetition.find({ where: { active: true } }, function(err, competition) {
	  		cb(null, competition);
	  	});
  };

  Solvieitcompetition.getCompetitionProjectsWithCity = async (competitionId) => {
	const { ProjectMember, CompetitionProject } = Solvieitcompetition.app.models;

    let competitionProjects = await CompetitionProject.find({where: {competitionId: competitionId},  include: ["solveitproject"]});

    for (let i = 0; i < competitionProjects.length; i++) {
        const element = competitionProjects[i];
        let members = await ProjectMember.find({where: {projectId: element.projectId}, include: ["userAccount"]});
        members.forEach(member => {
            if (member.userAccount()) {
                if (element["cities"]) {
                    element["cities"] = element["cities"].concat(member.userAccount().cityId);
                  } else {
                      element["cities"] = [member.userAccount().cityId];
                  }
            }
        })
        
    }
    return competitionProjects;
}

Solvieitcompetition.remoteMethod("getCompetitionProjectsWithCity", {
    desctiption: "get the city of project",
    accepts: [{
        arg: "competitionId",
        type: "string",
        required: true
    }],
    http: {
      verb: "post",
      path: "/competition-projects"
    },
    returns: {
      type: "object",
      root: true
    }
  });

	Solvieitcompetition.remoteMethod(
		'getActiveCompetition',
		{
			http: {path: '/active', verb: 'get'},
			returns: {arg: 'Result', type: 'Object'}
		}
	);

};
