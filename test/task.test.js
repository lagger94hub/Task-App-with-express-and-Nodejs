// we use supertest to fire off requests to our app without having the server up and running
const request = require('supertest')

const Task = require('../src/models/task')

// requiring the app to be used by super test
const app = require('../src/app')

// requiring the initial database setup
const {user1Id, user1, setupDatabase, user2, user2Id, task1} = require('./fixtures/db')

// to tel jest to do this function before each test
// here we are cleaning the database before each test
beforeEach(setupDatabase)

test('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send({
      description: 'this is done with test'
    })
    .expect(201)
    const task = Task.findById(response.body._id)
    expect(task).not.toBeNull()
})

test('should get users tasks', async () => {
  const response = await request(app)
  .get('/tasks')
  .set('Authorization', `Bearer ${user1.tokens[0].token}`)
  .send()
  .expect(200)
  expect(response.body.length).toBe(2)
})

test('should not allow user to delete other users tasks', async () => {
  const response = await request(app)
  .delete(`/tasks/${task1._id}`)
  .set('Authorization', `Bearer ${user2.tokens[0].token}`)
  .expect(404)
  const task = await Task.findById(task1._id)
  expect(task).not.toBeNull()

})
