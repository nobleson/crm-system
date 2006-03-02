const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../db/config.js')

const authSchema = mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        },
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }],
    userClaims: {
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        userRole: {
            type: String,
            default: 'Buyer & Seller',
        },

    },
    dateRegistered: {
        type: Date,
        default: Date.now,
    },

})
authSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})

authSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    if (user) {
        // generate an access token
        const accessToken = jwt.sign({ _id: user._id, role: user.userClaims.userRole }, secret.accessTokenSecret, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ _id: user._id, role: user.userClaims.userRole  },  secret.refreshTokenSecret);

        secret.refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }

    const user = this
    const token = jwt.sign({ _id: user._id }, config.secret)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

authSchema.statics.findByCredentials = async (email, password) => {
    // Search for a email by username and password.
    const user = await Authentication.findOne({ email })
    if (!user) {
       // return new Error({ error: 'Invalid email used' })
        throw new Error({ error: 'Invalid login credentials' })
    }
    console.log('compare', user.password)
    console.log('password', password)
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid password' })
    }
    return user
}

authSchema.set('toJSON', { virtuals: true })

const Authentication = mongoose.model('Authentication', authSchema)

module.exports = Authentication
