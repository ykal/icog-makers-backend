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



	Solvieitcompetition.remoteMethod(
		'getActiveCompetition',
		{
			http: {path: '/active', verb: 'get'},
			returns: {arg: 'Result', type: 'Object'}
		}
	);

};
