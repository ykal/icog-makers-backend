'use strict';

module.exports = function(Solvieitcompetition) {

	Solvieitcompetition.getActiveCompetition = function(cb){
		Solvieitcompetition.find({ where: { active: true } }, function(err, competition) {
	  		cb(null, competition);
	  	});
  };



	Solvieitcompetition.remoteMethod(
		'getActiveCompetition',
		{
			http: {path: '/active', verb: 'get'},
			returns: {arg: 'Result', type: 'Object'}
		}
	);

};
