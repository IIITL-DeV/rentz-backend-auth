const redis = require('redis')
require("dotenv").config();
const client = redis.createClient(process.env.REDIS_TLS_URL, {
    tls: {
        rejectUnauthorized: false
    }
}
);

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
