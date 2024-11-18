const express = require('express');
const messagesRouter = express.Router();
const { messagesController } = require('../controllers/messagesController.js');
const { verifyToken } = require('../controllers/authController.js');

messagesRouter.get('/getMessages/:userid', verifyToken, messagesController.getMessages);
messagesRouter.get('/getChatDetails/:chatId1/:chatid2', verifyToken, messagesController.getChatDetails);
messagesRouter.post('/sendMessage/:senderid/:receiverid', verifyToken, messagesController.sendMessage)

module.exports = { messagesRouter };