const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient(REDIS_PORT);

const app = express();

//set response
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos.</h2>`;
}

const getRepos = async (req, res) => {
  try {
    console.log("Fetching data");
    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    const repos = data.public_repos;

    // set to redis
    redisClient.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

app.get("/repos/:username", getRepos);

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
