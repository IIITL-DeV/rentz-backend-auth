const express = require('express');
const app = express();
const url = require('url');
const morgan = require('morgan');
const createError = require('http-errors');
const { verifyAccessToken } = require('./helper/jwt_helper');
const authRoutes = require('./routes/auth_routes');
const cors = require('cors')
const User = require('./model/user');
const server = require('http').createServer(app);
// global.io = require('socket.io').listen(server);

require('dotenv').config();
require('./helper/init_mongoose');
require('./helper/init_redis');


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/', verifyAccessToken, async (req, res, next) => {
    try {
        console.log(req);
        res.send("server is up and running...");
    } catch (error) {
        next(err);
    }
})
app.get('/test', (req, res) => {
    console.log(req.headers);
    res.send("Server is up and running...");
})
app.get('/profile', verifyAccessToken, async (req, res) => {
    const user = await User.findById(req.payload.aud);
    console.log(user);
    res.send(user);
})
app.post('/test', (req, res) => {
    console.log(req.headers);
    res.send("Server is up and running...");
})


app.use('/auth', authRoutes);


app.use(async (req, res, next) => {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    next(createError.NotFound(`this ${fullUrl} route doesnot exist`));
})
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        },
    })
    console.log(err);
})

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
})