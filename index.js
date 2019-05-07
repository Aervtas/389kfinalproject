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

//Let's hope nothing breaks

app.get('/',function(req,res){
  Game.find({}, function(err, games){
    if (err) {
      throw err;
    }
    Music.find({}, function(err, musics){
      if (err) {
        throw err;
      }
      res.render('home',{
        gdata: games,
        mdata: musics
      });
    });
  });


});

app.get('/game', function(req, res){
  res.render('createGame');
});

app.get('/music', function(req, res){
  res.render('createMusic');
});

//post endpoint for games
app.post('/game', function(req, res) {
  var game = new Game({
      title: req.body.title,
      genre: req.body.genre.split(" "),
      year: parseInt(req.body.year),
      company: req.body.company,
      reviews: []
  })

  game.save(function(err) {
      if(err) throw err
      //return res.send("Game uploaded!");
      console.log("Game uploaded!");
      return res.redirect('/');
  })
});

//post endpoint for music
app.post('/music', function(req, res) {
  var music = new Music({
      title: req.body.title,
      genre: req.body.genre.split(" "),
      year: parseInt(req.body.year),
      composer: req.body.composer,
      reviews: []
  })

  music.save(function(err) {
      if(err) throw err
      //return res.send("Music uploaded!")
      console.log("Music uploaded!");
      return res.redirect('/');
  })
});

app.get('/api/gamereviews', function(req, res){
  Game.find({}, function(err, games){
    if (err) {
      throw err;
    }
    return res.send(games);
  });
});

app.get('/api/musicreviews', function(req, res){
  Music.find({}, function(err, musics){
    if (err) {
      throw err;
    }
    return res.send(musics);
  });
});

app.get('/game/:id/review', function(req, res){
  Game.findOne({_id: req.params.id}, function(err, game){
    if (err) {
      res.render('notFound');
    } else if (!game) {
      res.render('notFound');
    } else {
      res.render('createGameReview', {
        data: game.title
      });
    }

  });
});

app.post('/game/:id/review', function(req, res) {
    Game.findOne({_id: req.params.id}, function(err, game){
        if(err) throw err
        var review = {
            rating: parseFloat(req.body.rating),
            comment: req.body.comment,
            author: req.body.author
        }
        /* mongo $pushAll is deprecated (mongoose.push builds ontop of $pushall)
            instead we use .concat()
        */
        game.reviews = game.reviews.concat([review])
        game.save(function(err){
            if (err) throw err
            return res.send("Game review added!")
        })
    });
});

app.get('/music/:id/review', function(req, res){
  Music.findOne({_id: req.params.id}, function(err, music){
    if (err) {
      res.render('notFound');
    } else if (!game) {
      res.render('notFound');
    } else {
      res.render('createMusicReview', {
        data: music.title
      });
    }

  });
});

app.post('/music/:id/review', function(req, res) {
    Music.findOne({_id: req.params.id}, function(err, music){
        if(err) throw err
        var review = {
            rating: parseFloat(req.body.rating),
            comment: req.body.comment,
            author: req.body.author
        }
        /* mongo $pushAll is deprecated (mongoose.push builds ontop of $pushall)
            instead we use .concat()
        */
        music.reviews = music.reviews.concat([review])
        music.save(function(err){
            if (err) throw err
            return res.send("Music review added!")
        })
    });
});

// Listening here
app.listen(process.env.PORT || 3000, function() {
    console.log('Listening!');
});
