const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/auth_controller');

router.post('/register', authcontroller.register)

router.post('/login', authcontroller.login)

router.post('/login/google', authcontroller.googleauth)

router.post('/verify', authcontroller.verify)

router.post('/login/facebook', authcontroller.facebookauth)

router.post('/refresh-token', authcontroller.refreshToken)

router.delete('/logout', authcontroller.logout)

module.exports = router;