const express = require('express');
const jobsRouter = express.Router();
const { jobsController } = require('../controllers/jobsController.js');

jobsRouter.get('/getAllJobs', jobsController.getAllJobs);

module.exports = { jobsRouter };