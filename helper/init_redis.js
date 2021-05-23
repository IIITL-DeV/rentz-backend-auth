const redis = require('redis')
require("dotenv").config();
const client = redis.createClient({
    port: process.env.redisPort,
    host: process.env.redisURI,
    password: process.env.redisKey
})

client.on('connect', () => {
    console.log("client connected to redis")
})
client.on('ready', () => {
    console.log("client redis is ready")
})
client.on('err', (err) => {
    console.log(err.message)
})
client.on('end', () => {
    console.log("Redis client disconnected")
})
process.on('SIGINT', () => {
    client.quit()
})

module.exports = client
