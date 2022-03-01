// Initialize Project App
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//Require DNS for hostname lookup
const dns = require("dns");
// Parse Form Data
var bodyParser = require('body-parser');
// Print Circular JSON Reference
const circularJSON = require('flatted');
// For parsing application/json
app.use(bodyParser.json());
// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
//Load Static Assets
app.use('/public', express.static(`${process.cwd()}/public`));
//Load Landing Page
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

var requestURL;

// URL Shortener Service
app.post('/api/shorturl', function (req, res) {
  console.log("Request " + circularJSON.stringify(req));
  let requestBody = req.body;
  console.log("Request Body " + JSON.stringify(requestBody));
  //Check if URL is valid
  try {
    checkProtocol(requestBody);
  } catch (e) {
    console.log("Error in URL " + e);
    res.json(prepareInvalidResponse());
    return;
  }
  //Check if hostname is valid
  console.log("Request URL inside Request Body is " + JSON.stringify(requestURL));
  dns.lookup(requestURL.hostname, function onLookup(err, address, family) {
    console.log('Got IP Address ', address);
    if (typeof address == 'undefined') {
      console.log("Error while Lookup " + err);
      res.json(prepareInvalidResponse());
      return;
    }
    res.json(prepareValidResponse());
  });
});

// URL Shortener Invoker Service
app.get('/api/shorturl/:short_url', function (req, res) {
  let shortURL = req.params['short_url'];
  console.log("Requested URL " + shortURL);
  console.log("Redirecting to Old Request " + requestURL);
  res.redirect(requestURL);
});

function checkProtocol(requestBody) {
  requestURL = new URL(requestBody.url);
  if (requestURL.protocol != 'http' && requestURL.protocol != 'https:') {
    console.log("Requested Protocol " + requestURL.protocol);
    throw "Requested Invalid Protocol";
  }
}

//Prepare Invalid Error Response
function prepareInvalidResponse() {
  let responseData = { "error": "invalid url" };
  console.log("Prepared Response Data " + JSON.stringify(responseData));
  return responseData;
}

//Prepare Valid Expected Response
function prepareValidResponse() {
  let shortURL = 1;
  let responseData = { "original_url": requestURL, "short_url": shortURL };
  console.log("Prepared Response Data " + JSON.stringify(responseData));
  return responseData;
}

//Server Listening to Port
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});  
