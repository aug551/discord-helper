require('dotenv').config()
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const users = require('./users.json');


// Anime functions
async function animeSearch(animeName, limit = 5, nextPage = "") {
    let url = `https://api.myanimelist.net/v2/anime?q=${animeName}&limit=${limit}&fields=alternative_titles,start_date,end_date,synopsis,status,num_episodes,studios`;

    if (nextPage != "") url = nextPage;

    let res = await fetch(url, {
        headers: {
            "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID
        }
    })

    let searchResults = await res.json();
    return searchResults;
}

async function isUserActive(userId) {
    if (!users[userId]) return false;

    let now = new Date();

    if (now > users[userId].refreshTokenExpiry) return false;
    if (now > users[userId].accessTokenExpiry) {
        let refreshed = await refreshTokens(userId);
        return refreshed;
    }

    return true;
}

function logout(userId) {
    if (!users[userId]) return 404;

    delete users[userId];
    saveToFile(users);
    return 202;
}

async function getUserDetails(userId) {
    let userActive = await isUserActive(userId);
    if (!userActive) return;

    let userTokens = users[userId];

    let rawResponse = await fetch('https://api.myanimelist.net/v2/users/@me', {
        headers: {
            Authorization: `Bearer ${userTokens.access_token}`
        }
    });

    let response = await rawResponse.json();
    return response;
}

function setTimestamps(tokens) {
    if (tokens.error) return "error";

    tokens["createdOn"] = new Date().getTime();
    tokens["accessTokenExpiry"] = new Date().getTime() + tokens.expires_in;
    tokens["refreshTokenExpiry"] = new Date().getTime() + 2592000000; // 30 days

    return tokens;
}

async function getTokens(code) {
    let toSend = {
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_CLIENT_SECRET,
        code: code,
        code_verifier: process.env.MAL_CODE_VERIFIER,
        grant_type: 'authorization_code'
    };
    let tokens = await postData('https://myanimelist.net/v1/oauth2/token', toSend);


    tokens = setTimestamps(tokens);

    return tokens;
}

async function refreshTokens(userId) {
    let toSend = {
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: users[userId].refresh_token
    };

    let tokens = await postData('https://myanimelist.net/v1/oauth2/token', toSend);

    tokens = setTimestamps(tokens);
    users[userId] = tokens;
    saveToFile(users);

    return true;
}

async function postData(url, data) {
    let query = [];
    for (const key in data) {
        query.push(key + "=" + data[key]);
    }
    query = query.join('&');

    let rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: query
    });

    let jsonResponse = await rawResponse.json();
    return jsonResponse;
}

function saveToFile(current) {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(current, null, 4));
    return 201;
}

module.exports = { isUserActive, getTokens, refreshTokens, saveToFile, getUserDetails, logout, animeSearch };