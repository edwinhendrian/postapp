const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { mongoUrl } = require('./config');

global.mongoose = require('mongoose');
mongoose
    .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => console.log('DB connected.'),
        (err) => console.log('DB connection error: ', err)
    );

const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use(async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use('/user', require('./api/user'));
app.use('/post', require('./api/post'));
app.use('/comment', require('./api/comment'));
app.use('/reply', require('./api/reply'));

module.exports = app;
