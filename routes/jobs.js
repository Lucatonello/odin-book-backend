const express = require('express');
const jobsRouter = express.Router();
const { jobsController } = require('../controllers/jobsController.js');
const { verifyToken } = require('../controllers/authController.js');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

jobsRouter.get('/getAllJobs', verifyToken, jobsController.getAllJobs);
jobsRouter.get('/getJobInfo/:companyid/:userid', verifyToken, jobsController.getJobInfo);
jobsRouter.post('/newJobPost/:companyid', verifyToken, jobsController.newJobPost);
jobsRouter.post('/applyToJob/:jobid/:userid', verifyToken, upload.single('cv'), jobsController.applyToJob);
jobsRouter.get('/getJobApplicants/:jobid', verifyToken, jobsController.getJobApplicants)

module.exports = { jobsRouter };