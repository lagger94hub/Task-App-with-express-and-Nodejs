// use the @sendgrid/mail module to send emails from our app
const sgMail = require('@sendgrid/mail')

// create the send grid api key, we got this key from the send grid account
const sendGridApiKey = process.env.SENDGRID_API_KEY

// attach the key to the sgMail object
sgMail.setApiKey(sendGridApiKey)



const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ramisaadaldden@gmail.com',
    subject: 'Welcom to tasks app',
    text: `Hello ${name} this is the welcome email for tasks app`
  })
}

const sendByeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ramisaadaldden@gmail.com',
    subject: 'Why are you leaving sir ??',
    text: `Dear Mr.${name}, why are you running from our company ? `
  })
}

module.exports = {
  sendWelcomeEmail,
  sendByeEmail
}

