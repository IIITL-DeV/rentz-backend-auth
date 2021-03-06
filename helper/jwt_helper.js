const jwt = require('jsonwebtoken')
const client = require('./init_redis');
const createError = require("http-errors")
require('dotenv').config();
module.exports = {
    signAccessToken: (userid) => {
        return new Promise((resolve, reject) => {
            const payload = {
            };
            const secret = process.env.accessTokenSecret
            const option = {
                expiresIn: "1h",
                issuer: "Authtication Service",
                audience: userid
            }
            jwt.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message);

                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization'].split(' ');
        const token = authHeader[1];
        console.log(token);
        jwt.verify(token, process.env.accessTokenSecret, (err, payload) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') return next(createError.Unauthorized())
                else {
                    return next(createError.Unauthorized(err.message))
                }
            }
            req.payload = payload
            next();
        })
    },
    signRefreshToken: (userid) => {
        return new Promise((resolve, reject) => {
            const payload = {

            }
            const secret = process.env.refreshTokenSecret;
            const option = {
                expiresIn: "1y",
                issuer: "Authentication Service",
                audience: userid
            }
            jwt.sign(payload, secret, option, async (err, token) => {
                if (err) {
                    console.log(err.message);
                    return reject(createError.InternalServerError())
                }
                client.set(userid, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log(err);
                        reject(createError.InternalServerError())
                        return;
                    }
                    resolve(token)
                })

            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.refreshTokenSecret, async (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const userid = payload.aud
                client.get(userid, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                    }
                    if (refreshToken == result) return resolve(userid);
                    reject(createError.Unauthorized())
                })
                return resolve(userid);
            })
        })
    },
    signEmailverification: () => {
        return new Promise((resolve, reject) => {
            const payload = {
            };
            const secret = process.env.emailVerificationSecret
            const option = {
                expiresIn: "1h",
                issuer: "Authtication Service",
                audience: userid
            }
            jwt.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message);

                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    emailverification: (token) => {
        jwt.verify(token, process.env.emailVerificationSecret, (err, payload) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') return next(createError.Unauthorized())
                else {
                    return next(createError.Unauthorized(err.message))
                }
            }
            req.payload = payload
            next();
        })

    }
}
