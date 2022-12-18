const express = require('express');
const app = express();
const { myanimelistRouter } = require('./resources/MyAnimeList');

app.use('/api/myanimelist', myanimelistRouter);

app.get('/', (req, res) => {
    res.send('test');
})

module.exports = app;