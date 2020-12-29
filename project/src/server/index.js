require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// your API calls

app.get("/spirit", async (req, res) => {
  try {
    const rover = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    const roverPhotos = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&page=1&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ rover, roverPhotos });
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/curiosity", async (req, res) => {
  try {
    const rover = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    const roverPhotos = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=1&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ rover, roverPhotos });
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/opportunity", async (req, res) => {
  try {
    const rover = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    const roverPhotos = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?sol=1000&page=1&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ rover, roverPhotos });
  } catch (err) {
    console.log("error:", err);
  }
});

// example API call
app.get("/apod", async (req, res) => {
  try {
    const image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
