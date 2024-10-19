const express = require('express');
const membersRouter = express.Router();
const { membersController } = require('../controllers/membersController'); 

membersRouter.get('/:action(getUserData|getCompanyData)/:type/:id', membersController.getUserData);
membersRouter.get('/getMemberActivity/:type/:id', membersController.getMemberActivity);
membersRouter.get('/getUserExperience/:id', membersController.getUserExperience);

module.exports = { membersRouter };
