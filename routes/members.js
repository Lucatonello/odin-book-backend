const express = require('express');
const membersRouter = express.Router();
const { membersController } = require('../controllers/membersController'); 

membersRouter.get('/:action(getUserData|getCompanyData)/:type/:id', membersController.getUserData);

module.exports = { membersRouter };
