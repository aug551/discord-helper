
const express = require('express');
const myanimelistRouter = express.Router();
const { getTokens, saveToFile } = require('./MyAnimeList');
const users = require('./users.json');

myanimelistRouter.use(express.json());

myanimelistRouter.get('/', async (req, res) => {
    let code = req.query.code;
    let user = req.query.state;
    if (!code || !user) return res.sendStatus(400);
    if (users[user]) return res.sendStatus(409);

    let tokens = await getTokens(code);

    if (tokens == "error") return;

    users[user] = tokens;

    saveToFile(users);

    res.send('Sucessfully logged in!\nTry the command again.');
});

module.exports = myanimelistRouter;