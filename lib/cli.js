var 
program = require('commander');

program
.version(require('../package.json').version)
.option('-p, --port [x]', 'run the server on the given port');

program
.command('server')
.description('Start the server')
.action(function () {
  var server = require('./../lib/server');
  server.start(program);
});

function interpret() {
  program.parse(process.argv);

  if (program.args.length === 0) {
    program.help();
  }
}

module.exports = {
  interpret: interpret
};
