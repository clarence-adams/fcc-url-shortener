require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const {URL} = require('url');
const mongoose = require('mongoose');
const {Schema} = mongoose;
var bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema ({
  url: String
})

const UrlPair = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.use("/api/shorturl", bodyParser.urlencoded({extended: false}))

app.post("/api/shorturl", (req, res, done) => {
  const originalUrl = req.body.url
  // error checks creating a new URL object
  try {
    const urlObject = new URL(originalUrl)
  } catch (error) {
    return res.json({
      "error": "invalid url"
    })
  }

  // creates a URL object that can be easily parsed
  const urlObject = new URL(originalUrl)

  if (urlObject.protocol != "http:" && urlObject.protocol != "https:") {
    return res.json({
      "error": "invalid url"
    })
  }

  // URL validation
  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      return res.json({
        "error": "invalid url"
      })
    } else {
        let newUrl = new UrlPair({
          url: originalUrl
      })

      console.log(newUrl._id)
      console.log(mongoose.connection.readyState)

      newUrl.save((err, data) => {
        if (err) {
          return console.lerror(err)
        } else {
          done(null, data)
        }
      })
      
      res.json({
        "original_url": originalUrl, 
        "short_url": newUrl._id
      })
    }
  })
})

app.get("/api/shorturl/:shortUrl", (req, res, done) => {
  let shortUrl;

  UrlPair.findById(req.params.shortUrl, (err, data) => {
    shortUrl = data.url
    console.log(shortUrl)

    if (err) {
      return console.log(err)
    } else {
      res.redirect(shortUrl)
      done(null, data)
    }
  })
})