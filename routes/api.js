const axios = require('axios');
const moment = require('moment');
let express = require('express');
let router = express.Router();
let passport = require('passport');
let User = require('../models/user');
const middlewareObj = require('../middleware');
let Recommendation = require('../models/recommendation');
let PodcastEmail = require('../models/podcast');
let Cycle = require('../models/cycle');
let theSource = require('../middleware/theSource');
const cryptoRandomString = require('crypto-random-string');

router.get('/', (req, res) => {
  res.json({ 123: 345 });
});

module.exports = router;
