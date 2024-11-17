const express = require('express');
const postsRouter = express.Router()
const path = require('path');
const { postsController } = require('../controllers/postsController');

postsRouter.get('/getAllPosts/:userid', postsController.getAllPosts);
postsRouter.post('/addOneLike', postsController.addOneLike);
postsRouter.post('/addComment', postsController.addComment);
postsRouter.post('/newPost', postsController.newPost);
postsRouter.get('/getMemberNotifications/:memberid/:type', postsController.getMemberNotifications)
postsRouter.get('/getPostData/:postid/:userid', postsController.getPostData)

module.exports = { postsRouter };