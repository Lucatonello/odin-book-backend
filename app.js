const express = require('express');
const path = require('path');
const app = express();
const { authRouter } = require('./routes/auth.js')
const { postsRouter } = require('./routes/posts.js')
const { membersRouter } = require('./routes/members.js')
const { jobsRouter } = require('./routes/jobs.js');
const { messagesRouter } = require('./routes/messages.js');

const cors = require('cors');
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/users', authRouter);
app.use('/posts', postsRouter);
app.use('/members', membersRouter);
app.use('/jobs', jobsRouter);
app.use('/messages', messagesRouter);

app.listen(PORT, () => console.log('server running on port', PORT));
