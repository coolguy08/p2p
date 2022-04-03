const express = require('express');

const router = express.Router();

const Auth=require('./Auth/index');

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});


router.use('/user', Auth);

module.exports = router;
