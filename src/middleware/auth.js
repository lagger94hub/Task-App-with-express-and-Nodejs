const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // get the payload part of the token, this may throw an error if the token is not valid, in our case decoded has the id property of the user
    const user = await User.findOne({ _id: decoded._id, 'tokens.token' : token })
    if (!user) {
      throw new Error()
    }
    req.token = token //sending the token with request for routers to use
    req.user = user //sending the user with request for routers to use
    next()
  } catch (e) {
    res.status(401).send({ error: 'Please Authenticate'})
  }
}

module.exports = auth