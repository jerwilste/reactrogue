'use strict';


var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
//var passport = require('passport');
//var session = require('express-session');
var app = express();

var bodyparser = require('body-parser');
app.use(bodyparser.json() );       // to support JSON-encoded bodies
app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));

routes(app);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('listening on port ' + port + '...');
});