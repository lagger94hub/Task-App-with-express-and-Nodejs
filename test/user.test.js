// we use supertest to fire off requests to our app without having the server up and running
const request = require('supertest')

// requiring the app to be used by super test
const app = require('../src/app')

const User = require('../src/models/user')

// requiring the initial database setup
const {user1Id, user1, setupDatabase} = require('./fixtures/db')

// to tel jest to do this function before each test
// here we are cleaning the database before each test
beforeEach(setupDatabase)

// creating test cases, here we are using the request method of the supertest module to send a request to an API end point and this method will return the response
test('should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'sami',
    email: 'sami@example.com',
    password: 'ramisamikooko!'
  }).expect(201)

  // Assert that the database was changed correctly 
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'sami',
      email: 'sami@example.com'
    },
    token: user.tokens[0].token

  })
  expect(user.password).not.toBe('ramisamikooko!')
})

test('should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: user1.email,
    password: user1.password
  }).expect(200)

  const user = await User.findById(user1Id)
  // in this test here the time between creating the user and logining in is so little that a duplicate JWT is beign created the solution is to set a timeout to give a time to generate a token
  expect(user.tokens[1].token).toBe(response.body.token)
})

test('shouldnt login nonexisting user', async () => {
  await request(app).post('/users/login').send({
    email: 'hellow@gmail.com',
    password: 'kkeifiiEIEI@##'
  }).expect(400)
})
// here we have to send the Authorization header
test('should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get profile for an unauthanticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('should close account for a user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(user1Id)
  expect(user).toBeNull()
  
})

test('should not close the account if user is un authanticated', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

// here to upload a file we can use attach()
test('should upload avatar image', async () => {
  await request(app)
  .post('/users/me/avatar')
  .set('Authorization', `Bearer ${user1.tokens[0].token}`)
  .attach('avatar', 'test/fixtures/profile-pic.jpg')
  .expect(200)
  const user = await User.findById(user1Id)
  // here we use toEqual to compare objects
  // here we are checking that user.avatar equals any buffer
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
  const response = await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${user1.tokens[0].token}`)
  .send({
    name: 'lolo'
  })
  .expect(200)

  const user = await User.findById(user1Id)

  expect(user.name).toBe(response.body.name)
})

test('should not update invalid user fields', async () => {
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${user1.tokens[0].token}`)
  .send({
    surName: 'Saado'
  })
  .expect(400)
})