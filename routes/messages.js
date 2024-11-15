const express = require('express');
const messagesRouter = express.Router();
const { messagesController } = require('../controllers/messagesController.js');

messagesRouter.get('/getMessages/:userid', messagesController.getMessages);
messagesRouter.get('/getChatDetails/:chatId1/:chatId2', messagesController.getChatDetails);
messagesRouter.post('/sendMessage/:senderid/:receiverid', messagesController.sendMessage)

module.exports = { messagesRouter };