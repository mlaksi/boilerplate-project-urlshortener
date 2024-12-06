require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const exp = require("constants");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;
  console.log(original_url);

  //OPEN JSON FILE
  fs.readFile("urls.json", (err, urls) => {
    //IF THERE IS AN ERROR, NOTIFY AND RETURN
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }

    //IF THERE IS NOT AN ERROR, JSON STRING IS THERE FROM THE OPENED FILE, PARSE IT
    const urlsArray = JSON.parse(urls);
    let id = urlsArray.length + 1;

    const newUrl = { original_url: original_url, short_url: id };

    urlsArray.push(newUrl);
    const test = JSON.stringify(urlsArray);

    //WRITE DATA TO FILE (where to write, what to write, notify of error or success)
    fs.writeFile("urls.json", JSON.stringify(urlsArray, null, 2), (err) => {
      if (err) {
        res.status(500).send("Error writing to file");
        return;
      }
      res.json({ original_url: original_url, short_url: id });
      //res.status(200).send("Added url to the improvised db");
    });
  });
});

app.get("/api/shorturl/:short", (req, res) => {
  //use parameter from url to query the json database to return url to be redirected to
  const short_url = req.params.short;
  //console.log(typeof short_url);

  fs.readFile("urls.json", (err, data) => {
    if (err) {
      res.status("500").send("Error reading JSON db");
      return;
    }

    const urls = JSON.parse(data);
    const match = urls.find((url) => url.short_url == short_url);
    if (match) {
      res.redirect(match.original_url);
    } else {
      res.json({ error: "Wrong format" });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
