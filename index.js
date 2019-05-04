var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var Game = require('./models/Game');
var Music = require('./models/Music');
var app = express();

// Load envirorment variables
dotenv.config();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */

 // Connect to MongoDB
 console.log(process.env.MONGODB)
 mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });
 mongoose.connection.on('error', function() {
     console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
     process.exit(1);
 });

app.get('/',function(req,res){
  res.render('home',{});
})



app.listen(process.env.PORT || 3000, function() {
    console.log('Listening!');
});
