const express = require('express');
const path = require('path');
const app = express();
const authRouter = require('./routes/auth.js')
const indexRouter = require('./routes/index.js')

const cors = require('cors');
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', authRouter);
app.use('/', indexRouter);

app.listen(PORT, () => console.log('server running on port', PORT));
