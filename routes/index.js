const express = require('express');
const indexRouter = express.Router()
const path = require('path');
const indexController = require('../controllers/indexController')

indexRouter.get('/', (req, res) => res.send('hello'));

module.exports = { indexRouter };