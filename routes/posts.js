const express = require('express');
const postsRouter = express.Router()
const path = require('path');
const { postsController } = require('../controllers/postsController');

postsRouter.get('/getAllPosts', postsController.getAllPosts);
postsRouter.post('/addOneLike', postsController.addOneLike);
postsRouter.post('/addComment', postsController.addComment);
postsRouter.post('/newPost', postsController.newPost);

module.exports = { postsRouter };