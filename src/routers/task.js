const express = require('express')

// creating a router
const router = express.Router()

// including the taks model
const Task = require('../models/task')

const auth = require('../middleware/auth')

// Task end points

// * Create a task for an authenticated user  *
router.post('/tasks', auth, async (req, res) => {

  const task = new Task({...req.body, owner: req.user.id})

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }

  // code without using async-await
  // const task = new Task(req.body)
  // task.save().then(() => {
  //   res.status(201).send(task)
  // }).catch((error) => {
  //   res.status(400).send(error)
  // })
})

// * Read  * /tasks?completed=true
//  /tasks?limit=4&skip=0
// /tasks?sortBy=createdAt_desc or we can say createdAt:desc
router.get('/tasks', auth, async (req, res) => {

  const match = {}
  if (req.query.completed){
    //this will set match.completed to boolean true if the condition is satisfied
    match.completed = req.query.completed === 'true'
    console.log(match.completed)
  }


  const sort = {}
  if (req.query.sortBy) {

    const part = req.query.sortBy.split('_')
    // -1 stands for descending , and 1 stands for ascending
    sort[part[0]]= part[1] === 'desc' ? -1 : 1
    
  }
  try {
    // we could have used find with filter but here we are using populate so we have to add match object to filter
    await req.user.populate({
      path: 'tasks',
      match, // this is an object
      options : {

         //how many results should i get from the database we use parse because the limit in the query string is a string value, if limit is not provided or limit is not a valid integer the limit will be ignored
         // the skip is to tell how many result we want to skip, if the page limit is 4 for example and we skip 4 we reach the second page, if we skip 8 we reach the third page
        limit: parseInt(req.query.limit), 
        skip: parseInt(req.query.skip),
        sort //this is an object
      }
    }) //using the populate function to use the relationship between users and tasks , here as an argument we pass the virtual field name, if we want the reverse relationship we would've put populate('owner')
    res.status(200).send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }

  // code without using async-await
  // Task.find({}).then((task) => {
  //   res.send(task)
  // }).catch((error) => {
  //   res.status(500).send()
  // })
})

// * Read one *
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({
      _id,
      owner: req.user.id
    })
    if (!task) {
      return res.status(404).send()
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }

  // code without using async-await
  // Task.findById(id).then((task) => {
  //   if (!task) {
  //     return res.status(404).send()
  //   }
  //   res.send(task)
  // }).catch((error) => {
  //   res.status(500).send()
  // })
})

// * update one *
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = [ 'description', 'completed' ]
  const isValidUpdate = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidUpdate) {
    return res.status(400).send({ error: 'not a valid update' })
  }
  try {

    const task = await Task.findOne({_id: req.params.id, owner: req.user.id})
    
    if (!task) {
      return res.status(404).send()
    }
    updates.forEach((update) =>task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

// * Delete one *
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
    if (!deletedTask) {
      return res.status(404).send()
    }
    res.send(deletedTask)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router