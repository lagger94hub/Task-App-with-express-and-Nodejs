const express = require('express')

//creating a router
const router = express.Router()

//require authentication function
const auth = require('../middleware/auth')

// include the User model to use it
const User = require('../models/user')

// using multer npm package to upload files
const multer = require('multer')

// using the sharp module to pre-process the images uploaded to the app
const sharp = require('sharp')

// requiring the account local module to send emails
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account')

// User end points * signup *
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save() // if we are not using the returning value we can skip assignment
    // send a welcome message to users upon signing up
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token }) //send function uses JSON.stringify in the background which will trigger the toJSON function automatically
  } catch (e) {
    res.status(400).send(e)
  }
  // code without using async-await
  // user.save().then(() => {
  //   res.status(201).send(user)
  // }).catch((error) => {
  //   res.status(400).send(error)
  //   // res.send(error)
  // })
})

// * User Login *
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token }) //send function uses JSON.stringify in the background which will trigger the toJSON function automatically
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    //req.user is provided by the auth function remember the auth is done first and it forwards the req.user and req.token to this function

    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token
    )
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})


// * Read profile * // here we add auth !!
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})


// * Read update *
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age'] //to set restrictions to which fields we are allowed to update
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'invalid operation' })
  }
  try {


    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // new true will make the findByIdAndUpdate function returns the new updated user instead of returning the old user before modification
    // note findbyidandupdate bypass mongoose's pre function so it cannot be used with it so we replaced it with manual update 

    res.send(req.user)

  } catch (e) {
    res.status(400).send(e)
  }
})

// * Delete one *
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
   
    // send a bye bye message to users upon deleting account
    sendByeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})


const upload = multer({
  // dest: 'avatars',// specifying the destination folder to save the image if we dont use the destination property the multer won't save the image to files instead it will keep it to be used by the route handler
  limits: {
    fileSize: 1000000 //limiting the file size to 1Mb
  },
  // this is a filtering function used by multer to filter the files that accepts, using the file argument we can reach useful information about the file beign uploaded, we have also a callback that will be called with an error if the extension is not valid, or it will be called with an undefiend error and a boolean true 
  fileFilter(request, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg|JPG|PNG|JPEG)$/)) {
      return cb(new Error('Only jpg, jpeg and png formats are allowed'))
    }
    cb(undefined, true)
  }
})
//upload a profile picture , and provide the avatar key for the multer middleware so that when the request is send the middleware can snatch the file from the request
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

  // req.user.avatar = req.file.buffer save data from file buffer provided by multer to user avatar field, note if dest is specified in multer we wont be able to use file.buffer

  // Here instead of the above lines we are using the sharp npm module to pre-process the image before saving it to the data base, here we unified all images to be png with size of 250 X 250  
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  req.user.avatar = buffer
  await req.user.save()
  res.send()
  // the below function is used when we want to handle error comming from middleware that we have not created like multer, if we don't use this method the error returned by the middleware will be shown as html error 
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    // here we set the type in the header of the response to be img/png, by default it is application/json
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})



module.exports = router