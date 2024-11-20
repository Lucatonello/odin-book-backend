const express = require('express');
const postsRouter = express.Router();
const path = require('path');
const { postsController } = require('../controllers/postsController');
const { verifyToken } = require('../controllers/authController');

postsRouter.get('/getAllPosts/:userid/:type', verifyToken, postsController.getAllPosts);
postsRouter.post('/addOneLike', verifyToken, postsController.addOneLike);
postsRouter.post('/addComment', verifyToken, postsController.addComment);
postsRouter.post('/newPost', verifyToken, postsController.newPost);
postsRouter.get('/getMemberNotifications/:memberid/:type', verifyToken, postsController.getMemberNotifications);
postsRouter.get('/getPostData/:postid/:userid/:type', verifyToken, postsController.getPostData);

module.exports = { postsRouter };