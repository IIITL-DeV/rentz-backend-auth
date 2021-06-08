const createError = require('http-errors');
const User = require('../model/user');
const { signAccessToken, signRefreshToken, verifyRefreshToken, emailverification } = require('../helper/jwt_helper');
const client = require('../helper/init_redis');
const axios = require('axios').default;
module.exports = {
    register: async (req, res, next) => {
        try {

            const { email, password, name } = req.body
            if (!email || !password) throw createError.BadRequest("bad request")

            const exist = await User.findOne({ email })

            if (exist) throw createError.Conflict(`${email} is already present`)

            const user = new User({ email, password, name });

            const savedUser = await user.save();
            const accessToken = await signAccessToken(savedUser.id);
            const refreshToken = await signRefreshToken(savedUser.id);
            res.send({ accessToken, refreshToken });
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const user = await User.findOne({ email: req.body.Email })
            console.log(user);
            if (!user) throw createError.NotFound("user not registered")
            const isMatch = await user.isValidPassword(req.body.Password)
            console.log(isMatch);
            if (!isMatch) throw createError.Unauthorized('Username/password incorrect')
            const accessToken = await signAccessToken(user.id);
            const refreshToken = await signRefreshToken(user.id);
            res.send({ accessToken, refreshToken })
        } catch (error) {
            next(error);
        }
    },
    verify: async (req, res, next) => {
        try {
            const token = req.query.id;
            const userid = await emailverification(token);
            await User.findOneAndUpdate({ id: userId }, { verified: true });
            res.send("Email Verified successfully...");
        } catch (error) {
            next(error);
        }
    },
    googleauth: async (req, res, next) => {
        try {
            const authHeader = req.headers['access_token'];
            const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`;
            const result = await axios.get(url, { headers: { Authorization: `Bearer ${authHeader}` } });
            const { email, verified_email, id, name, picture } = result.data;
            if (!email && !id) throw createError.BadRequest("bad request")

            const existedUser = await User.findOne({ email })
            if (existedUser) {

                if (existedUser.googleId == id) {
                    const accessToken = await signAccessToken(existedUser.id);
                    const refreshToken = await signRefreshToken(existedUser.id);
                    res.send({ accessToken, refreshToken });
                }
                else throw createError.BadRequest("SignIn using email and password");
            }

            else {
                const user = new User({ email, googleId: id, name, imageUrl: picture, verified: verified_email });
                const savedUser = await user.save();
                const accessToken = await signAccessToken(savedUser.id);
                const refreshToken = await signRefreshToken(savedUser.id);
                res.send({ accessToken, refreshToken });
                
            }
        }
        catch (error) {
            next(error);
        }

    },
    facebookauth: async (req, res, next) => {
        try {
        }
        catch (error) {
            next(error);
        }

    },
    refreshToken: async (req, res, next) => {
        try {
            let { refreshToken } = req.body
            if (!refreshToken) throw createError.BadRequest();
            const userid = await verifyRefreshToken(refreshToken);
            const accessToken = await signAccessToken(userid);
            refreshToken = await signRefreshToken(userid);
            res.send({ accessToken, refreshToken });
        } catch (error) {
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            console.log(req.headers);
            if (!refreshToken) throw createError.BadRequest();
            const userId = await verifyRefreshToken(refreshToken);
            client.del(userId, (err, val) => {
                if (err) {
                    console.log(err.message)
                    throw createError.InternalServerError();
                }
                console.log(val);
                res.sendStatus(204);
            })
        } catch (error) {
            next(error)
        }
    }
}