var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var Game = require('./models/Game');
var Music = require('./models/Music');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gm = require('gm');

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

 gm('/images/Gaming.jpg')
 .resize(353, 257)
 .autoOrient()
 .write('/images/ResultGaming.jpg', function (err) {
   if (!err) console.log('Image was altered.');
 });

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
      io.emit('new game', game);
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
      io.emit('new music', music);
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
        data: game
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
            console.log("Game review added!");
            return res.redirect('/');
        })
    });
});

app.get('/music/:id/review', function(req, res){
  Music.findOne({_id: req.params.id}, function(err, music){
    if (err) {
      res.render('notFound');
    } else if (!music) {
      res.render('notFound');
    } else {
      res.render('createMusicReview', {
        data: music
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
            console.log("Music review added!");
            return res.redirect('/');
        })
    });
});

app.get('/about', function(req, res) {
  res.render('about');
});

app.get('/game/remove/:id', function(req, res){
    Game.findOneAndDelete({_id: req.params.id}, function(err, game){
      if (!game) {
        res.render('notFound');
      } else {
        console.log("game removed");
        res.redirect('/');
      }
    });
});

app.get('/music/remove/:id', function(req, res){
    Music.findOneAndDelete({_id: req.params.id}, function(err, music){
      if (!music) {
        res.render('notFound');
      } else {
        console.log("music removed");
        res.redirect('/');
      }
    });
});

app.delete('/game/remove/:id', function(req, res){
  Game.findOneAndDelete({_id: req.params.id}, function(err, game){
    if (!game) {
      res.render('notFound');
    } else {
      console.log("game removed");
      res.redirect('/');
    }
  });
});

app.delete('/music/remove/:id', function(req, res){
  Music.findOneAndDelete({_id: req.params.id}, function(err, music){
    if (!music) {
      res.render('notFound');
    } else {
      console.log("music removed");
      res.redirect('/');
    }
  });
});



app.get('/game/tags', function(req, res){
    res.render('gameTags');
});

app.get('/music/tags', function(req, res){
    res.render('musicTags');
});

app.get('/game/greatest', function(req, res){
    var tempID = 0;
    var tempCheck = 0;
    //loop through Game and find game with the most reviews
    Game.find({}, function(err, games){
      if (err) {
        throw err;
      }
      for (var i = 0; i < games.length; i++) {
        if(games[i].reviews.length >= tempCheck) {
          tempID = games[i]._id;
          tempCheck = games[i].reviews.length;
        }
      }
      Game.findOne({_id: tempID}, function(err, game){
        res.render('display', {
          data: game
        });
      });
    });
});

app.get('/music/greatest', function(req, res){
    var tempID;
    var tempCheck = 0;
    //loop through Game and find music with the most reviews
    Music.find({}, function(err, games){
      if (err) {
        throw err;
      }
      for (var i = 0; i < games.length; i++) {
        if(games[i].reviews.length >= tempCheck) {
          tempID = games[i]._id;
          tempCheck = games[i].reviews.length;
        }
      }
      Music.findOne({_id: tempID}, function(err, game){
        res.render('display', {
          data: game
        });
      });
    });
});

app.get('/game/best', function(req, res){
  var tempID = 0;
  var tempCheck = 0;
  //loop through Game and find game with the most reviews
  Game.find({}, function(err, games){
    if (err) {
      throw err;
    }
    for (var i = 0; i < games.length; i++) {
      var aver = 0;
      for (var k = 0; k < games[i].reviews.length; k++) {
        aver = aver + games[i].reviews[k].rating;
      }
      aver = aver / games[i].reviews.length;
      if (aver >= tempCheck) {
        tempID = games[i]._id;
        tempCheck = aver;
      }
    }
    Game.findOne({_id: tempID}, function(err, game){
      res.render('display', {
        data: game
      });
    });
  });
});

app.get('/music/best', function(req, res){
  var tempID = 0;
  var tempCheck = 0;
  //loop through Game and find game with the most reviews
  Music.find({}, function(err, games){
    if (err) {
      throw err;
    }
    for (var i = 0; i < games.length; i++) {
      var aver = 0;
      for (var k = 0; k < games[i].reviews.length; k++) {
        aver = aver + games[i].reviews[k].rating;
      }
      aver = aver / games[i].reviews.length;
      if (aver >= tempCheck) {
        tempID = games[i]._id;
        tempCheck = aver;
      }
    }
    Music.findOne({_id: tempID}, function(err, game){
      res.render('display', {
        data: game
      });
    });
  });
});

app.get('/music/random', function(req, res){
  Music.find({}, function(err, musics){
    var rand = Math.floor(Math.random() * musics.length) + 0;
    res.render('display', {
      data: musics[rand]
    });
  });
});

app.get('/game/:id', function(req, res){
  Game.findOne({_id: req.params.id}, function(err, game){
    if (err) {
      res.render('notFound');
    }
    if (!game) {
      res.render('notFound');
    }
    res.render('display', {
      data: game
    });
  });
});

app.get('/music/:id', function(req, res){
  Music.findOne({_id: req.params.id}, function(err, music){
    if (err) {
      res.render('notFound');
    }
    if (!music) {
      res.render('notFound');
    }
    res.render('display', {
      data: music
    });
  });
});

io.on('connection', function(socket) {
    console.log('NEW connection.');
    socket.on('disconnect', function(){
        console.log('A user disconnected.');
      });
});

// Listening here
http.listen(process.env.PORT || 3000, function() {
    console.log('Listening!');
});
