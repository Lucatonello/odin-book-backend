const express = require('express');
const postsRouter = express.Router()
const path = require('path');
const { postsController } = require('../controllers/postsController');

postsRouter.get('/getAllPosts', postsController.getAllPosts);
postsRouter.post('/addOneLike', postsController.addOneLike);

module.exports = { postsRouter };