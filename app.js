const express = require('express');
const path = require('path');
const app = express();

const cors = require('cors');
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log('server running on port', PORT));
