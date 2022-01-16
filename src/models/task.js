const mongoose = require('mongoose')


const taskSchema = mongoose.Schema({

  description: {
    type: String,
    required: true,

  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: { //defining the relationship on the single side
    type: mongoose.Schema.Types.ObjectId, //just to say that we are storing a data of type objectid in the owner field
    required: true,
    ref: 'User' //create a relationship to user collection
  }

}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)


module.exports = Task