const express = require('express');
const messagesRouter = express.Router();
const { messagesController } = require('../controllers/messagesController.js');

messagesRouter.get('/getMessages/:userid', messagesController.getMessages);
messagesRouter.get('/getChatDetails/:chatid', messagesController.getChatDetails);

module.exports = { messagesRouter };