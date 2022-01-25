const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')
//  here we are creating a test user for testing our app
const user1Id = new mongoose.Types.ObjectId()
const user1 = {
  _id: user1Id,
  name: 'micke',
  email: 'micke@example.com',
  password: 'helloWorld123!',
  tokens: [{
    token: jwt.sign({ _id: user1Id }, process.env.JWT_SECRET)
  }]
}
const user2Id = new mongoose.Types.ObjectId()
const user2 = {
  _id: user2Id,
  name: 'MICK2',
  email: 'micke2@example.com',
  password: 'helloWorld123333FFFF!',
  tokens: [{
    token: jwt.sign({ _id: user2Id }, process.env.JWT_SECRET)
  }]
}

const task1 = {
  _id : new mongoose.Types.ObjectId(),
  description: 'task1',
  completed: false,
  owner: user1Id 
}
const task2 = {
  _id : new mongoose.Types.ObjectId(),
  description: 'task2',
  completed: true,
  owner: user1Id 
}
const task3 = {
  _id : new mongoose.Types.ObjectId(),
  description: 'task3',
  completed: true,
  owner: user2Id 
}

// function to be called before each test
const setupDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(user1).save()
  await new User(user2).save()
  await new Task(task1).save()
  await new Task(task2).save()
  await new Task(task3).save()
}

// send the initial data to be used by the jest test
module.exports = {
  user1Id,
  user1,
  setupDatabase,
  user2,
  user2Id,
  task1
}