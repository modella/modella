var model = require('./');

var User = model('user')
  .attr('_id', { type : 'string' })
  .attr('email', { type : 'string' });

var user = new User({ email : 'mattmuelle@gmail.com ' });
console.log(user.toJSON());
