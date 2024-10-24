const express = require('express');
const membersRouter = express.Router();
const { membersController } = require('../controllers/membersController'); 

membersRouter.get('/:action(getUserData|getCompanyData)/:type/:id', membersController.getUserData);
membersRouter.get('/getMemberActivity/:type/:id', membersController.getMemberActivity);
membersRouter.get('/getUserExperience/:id', membersController.getUserExperience);
membersRouter.get('/getUserEducation/:id', membersController.getUserEducation);
membersRouter.get('/getUserSkills/:id', membersController.getUserSkills);
membersRouter.put('/updateUserIntro/:userid', membersController.updateUserIntro);
membersRouter.put('/updateUserAbout/:userid', membersController.updateUserAbout);
membersRouter.post('/newExperience/:userid', membersController.newExperience);
membersRouter.put('/editExperience/:userid/:expid', membersController.editExperience);

module.exports = { membersRouter };
