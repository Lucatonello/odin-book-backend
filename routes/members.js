const express = require('express');
const membersRouter = express.Router();
const { membersController } = require('../controllers/membersController'); 

membersRouter.get('/getUserData/:type/:id', membersController.getUserData);
membersRouter.get('/getCompanyData/:type/:id', membersController.getCompanyData);
membersRouter.get('/getMemberActivity/:type/:id', membersController.getMemberActivity);
membersRouter.get('/getUserExperience/:id', membersController.getUserExperience);
membersRouter.get('/getUserEducation/:id', membersController.getUserEducation);
membersRouter.get('/getUserSkills/:id', membersController.getUserSkills);
membersRouter.put('/updateUserIntro/:userid', membersController.updateUserIntro);
membersRouter.put('/updateUserAbout/:userid', membersController.updateUserAbout);
membersRouter.put('/updateCompanyAbout/:companyid', membersController.updateCompanyAbout);
membersRouter.post('/newExperience/:userid', membersController.newExperience);
membersRouter.put('/editExperience/:userid/:expid', membersController.editExperience);
membersRouter.delete('/deleteExperience/:expid', membersController.deleteExperience);
membersRouter.post('/newEducation/:userId', membersController.newEducation);
membersRouter.put('/editEducation/:userid/:educationid', membersController.editEducation);
membersRouter.delete('/deleteEducation/:educationid', membersController.deleteEducation);
membersRouter.post('/newSkill/:userid', membersController.newSkill);
membersRouter.delete('/deleteSkill/:skillid', membersController.deleteSkill);
membersRouter.get('/getCompanyJobOpenings/:id', membersController.getCompanyJobOpenings);
membersRouter.put('/updateCompanyIntro/:id', membersController.updateCompanyIntro);
membersRouter.put('/changeJobStatus/:id', membersController.changeJobStatus);
membersRouter.post('/follow/:userid/:receiverid', membersController.follow);
membersRouter.get('/checkFollow/:userid/:memberid/:usertype/:membertype', membersController.checkFollow);
membersRouter.post('/unfollow/:userid/:receiverid', membersController.unfollow);
membersRouter.post('/connect/:userid/:receiverid', membersController.connect);
membersRouter.get('/getUserConnections/:userid', membersController.getUserConnections);
membersRouter.delete('/removeConnection/:userid/:connectionid', membersController.removeConnection)

module.exports = { membersRouter };
