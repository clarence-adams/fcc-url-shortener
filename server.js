require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const mongoose = require('mongoose');
const {Schema} = mongoose;
var bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState)

const urlSchema = new Schema ({
  url: String
})

const Url = mongoose.model("Url", urlSchema);

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

app.post("/api/shorturl/new", (req, res, done) => {

  let newUrl = new Url({
    url: req.body.url
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
    "url": req.body.url,
    "short_url": newUrl._id
  })
})

app.get("/api/shorturl/:shortUrl", (req, res) => {
  let shortUrl;

  Url.findById(req.params.shortUrl, (err, data, done) => {

    shortUrl = data.url
    console.log(shortUrl)
    res.redirect(shortUrl)

    if (err) {
      return console.log(err)
    } else {
      done(null, data)
    }
  })
})