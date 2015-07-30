module.exports = {
  database: 'localhost:27017/slack-agenda', // you need to have mongo running
  slack: {
    token: 'your-slack-token', // create a token for yourself under the right slack team
    // create this as an 'incoming webhook' under the admin pages of your slack team
    webhook: 'https://hooks.slack.com/services/your-slack-service'
  },
  hackpad: {
    site: 'your-hackpad-subdomain', // the name of the hackpad subsite the pad is in
    pad: 'your-hackpad-id-here', // the ID of the hackpad to draw the questions from
    id: 'your-id-here', // find this under 'account' while in the hackpad subsite
    secret: 'your-secret-here' // find this under 'account' while in the hackpad subsite
  }
};