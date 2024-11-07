const express = require('express');
const jobsRouter = express.Router();
const { jobsController } = require('../controllers/jobsController.js');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

jobsRouter.get('/getAllJobs', jobsController.getAllJobs);
jobsRouter.get('/getJobInfo/:id', jobsController.getJobInfo);
jobsRouter.post('/newJobPost/:companyid', jobsController.newJobPost);
jobsRouter.post('/applyToJob/:jobid/:userid', upload.single('cv'), jobsController.applyToJob);
jobsRouter.get('/getJobApplicants/:jobid', jobsController.getJobApplicants)

module.exports = { jobsRouter };