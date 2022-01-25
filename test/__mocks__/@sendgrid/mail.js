// Here we are mocking the sendgrid module to prevent sending emails to fake emails, this is achieved by telling the jest testing module that this is a mocking module so use it instead of the real one, below we have to mock the sgMail object that is used in the /emails/account.js file in order for this to work properly
module.exports = {
  setApiKey() {

  },
  send() {

  }
}