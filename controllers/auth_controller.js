const createError = require('http-errors');
const User = require('../model/user');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helper/jwt_helper');
const client = require('../helper/init_redis');


module.exports = {
    register: async (req, res, next) => {
        try {

            const { Email, Password, Name, role } = req.body
            console.log(role);
            if (!Email || !Password) throw createError.BadRequest("bad request")

            const exist = await User.findOne({ email: Email })

            if (exist) throw createError.Conflict(`${Email} is already present`)

            const user = new User({ email: Email, password: Password, name: Name, role });

            await user.save()
                .then(async (saveduser) => {
                    console.log(saveduser);
                    const accessToken = await signAccessToken(saveduser.id);
                    const refreshToken = await signRefreshToken(saveduser.id);
                    res.send({ accessToken, refreshToken })
                })
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
    googleauth: async (req, res, next) => {
        try {
            const { idToken } = req.body;
            const decodedToken = jwt.decode(idToken, { complete: true });
            const { email, name, imageUrl, email_verified } = decodedToken.payload;
        }
        catch (eror) {
            next(error);
        }

    },
    facebookauth: async (req, res, next) => {
        try {
        }
        catch (eror) {
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
            next(err)
        }
    }
}