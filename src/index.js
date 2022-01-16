// establishing the connection
require('./db/mongoose')

//inclucding the routers
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

// setting up  app and express 
const express = require('express')
const app = express()
const port = process.env.PORT

// middleware function, this is the entry point before going to routers
// app.use((req, res, next) => {
//   res.status(503).send('Website is currently under maintenance')
// })

app.use(express.json()) //will auto parse the incoming json request body into javascript objects
// use the routers included

app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
  console.log('Server is running on ', port)
})

