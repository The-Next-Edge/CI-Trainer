var
  _ = require('underscore'),
  conf = process.env.NODE_ENV === 'production' ? {} : require('./../config/config'),
  Agenda = require('agenda'),
  agenda = new Agenda({db: { address: process.env.MONGOLAB_URI || conf.database }}),
  express = require('express'),
  crypto = require('crypto'),
  request = require('request'),
  Hackpad = require('hackpad'),
  hackpad = new Hackpad(process.env.HACKPAD_ID || conf.hackpad.id, process.env.HACKPAD_SECRET || conf.hackpad.secret, {
    site: process.env.HACKPAD_SITE || conf.hackpad.site
  }),
  userListUrl = 'https://slack.com/api/users.list?pretty=1&token=' + (process.env.SLACK_TOKEN || conf.slack.token),
  participants = ['@robertbest', '@benroberts', '@connor'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function setupAgenda(app) {
  var
    questions = [],
    users = [];

  agenda.define('update questions', function(job, done) {
     hackpad.export(process.env.HACKPAD_PAD || conf.hackpad.pad, 'latest', 'txt', function (err, content) {
      if (err) {
        console.log('error updating questions!', err);
        return done();
      }

      questions = _.filter(content.split('\n'), function (item) {
        return !(item === '\n' || item === 'CI-Trainer' || item === '');
      });
      done();
    });
  });

  agenda.define('update users', function(job, done) {
    request.get(userListUrl, function (err, body, response) {
      if (err) {
        console.log('error updating users!');
        return done();
      }
      
      var
        r = JSON.parse(response);
      users = r.members;
      done();
    });
  });

  agenda.define('ping someone', function (job, done) {
    if (questions.length > 0) {
      var
        randUser = getRandomInt(0, participants.length),
        randMessage = getRandomInt(0, questions.length),
        text = participants[randUser] + ' ' + questions[randMessage],
        payload = { text: text, parse: 'full' },
        opts = {
          url: process.env.SLACK_WEBHOOK || conf.slack.webhook,
          form: JSON.stringify(payload)
        };

      request.post(opts, function (err, body, response) {
        done();
      });
    } else {
      done();
    }
  });

  agenda.now('update questions');

  agenda.every('30 minutes', 'update questions');
  
  agenda.every('4 hours', 'ping someone');

  agenda.start();
}

module.exports = {
  start: function () {
    var
      app = express(),
      port = process.env.PORT ? process.env.PORT : 4400,
      bodyParser = require('body-parser');

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    setupAgenda(app);

    app.listen(port);

    console.log('Up and running on port', port);
  }
};
