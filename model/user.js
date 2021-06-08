const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const userSchema = new Schema({
    name: {
        type: String,
    },
    contact: {
        type: String,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    googleId: {
        type: String,
    },
    facebookId: {
        type: String,
    },
    password: {
        type: String,
    },
    verified: {
        type: Boolean,
    }
})
userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(this.password, salt);
        this.password = hashedpassword;
        next();
    } catch (error) {

    }
})
userSchema.post('save', async () => {
    try {

    } catch (error) {

    }
})
userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}
const user = mongoose.model("user", userSchema);
module.exports = user