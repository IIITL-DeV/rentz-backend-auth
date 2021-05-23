const mongoose = require('mongoose');
require('dotenv').config();
mongoose.
    connect(process.env.mongoURI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    .then(() => {
        console.log("mongodb connected")
    })
    .catch((err) => {
        console.log(e.message)
    })

mongoose.connection.on('connected', () => {
    console.log("mongoose connected to db");
})

mongoose.connection.on('error', (err) => {
    console.log(err.message);
})

mongoose.connection.on('disconnected', () => {
    console.log('mongoose disconnected')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})