const express = require('express');
const jobsRouter = express.Router();
const { jobsController } = require('../controllers/jobsController.js');

jobsRouter.get('/getAllJobs', jobsController.getAllJobs);
jobsRouter.get('/getJobInfo/:id', jobsController.getJobInfo);
jobsRouter.post('/newJobPost/:companyid', jobsController.newJobPost)

module.exports = { jobsRouter };