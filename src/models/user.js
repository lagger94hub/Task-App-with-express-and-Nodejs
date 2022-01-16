const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }      
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error('password cannot contain password word')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
})

userSchema.virtual('tasks', { //defining the relationship on the many side by creating a virtual field called tasks
  ref: 'Task',  //collection that we are referencing
  localField: '_id', // to tell that a task's  owner field is connected to the _id field in the users collection
  foreignField: 'owner' //to tell that a task is referencing a user using owner fieled
})

// generateAuthToken is created by us and we attached to user instance of User model by using userSchema.methods , this function will be used to generate a jsonwebtoken , here we need this binding so we use normal function instead of arrow function  
userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET) // the payload of the token will have the user's id in it

  //add the token generated to the array of tokens of the user
  user.tokens = [...user.tokens, ...[{token}]]
  await user.save()
  return token
}

// this is triggered automatically whenever a JSON.strigify is called on a user object in this case this will be called when send({ user, token}) is called, here we are using normal function because we need this binding
userSchema.methods.toJSON = function () {
  const user = this
  
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject

}

// findByCredentials is created by us and we attached to User model by using userSchema.statics , this function will be used to authenticate user login
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Unable to login')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to login')
  }
  return user
}

// in the schema we can have more control over the model
// the pre means before saving happens
// hash the plain text password before saving
// here we use a normal function because middleware pre requires a this binding
userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// create a middleware to delete all tasks that belong to a user when deleting a user
userSchema.pre('remove', async function(next) {
  const user = this
  await Task.deleteMany({ owner: user.id})
  next()
})
const User = mongoose.model('User', userSchema)

// const me = new User({
//   name: '   Rami    ',
//   email: 'RAMI@GMail.com  ',
//   password: 'hellomynameisPassword'
// })

// me.save().then(() => {
//   console.log(me)
// }).catch((error) => {
//   console.log('Error', error)
// })  


module.exports = User