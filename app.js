var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();


// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://minuhub:tomato@cluster0-qi7ul.mongodb.net/test?retryWrites=true&w=majority');
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected'); });
db.on('error', function(err){
  console.log('DB ERROR : ', err); });

  // Other settings
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname+'/public'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(methodOverride('_method'));
  app.use(flash());
  app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Custom Middlewares
  app.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.util = util;
    next();
  });

  // Routes
  app.use('/', require('./routes/home'));
  app.use('/posts', util.getPostQueryString, require('./routes/posts'));
  app.use('/users', require('./routes/users'));
  app.use('/comments', util.getPostQueryString, require('./routes/comments'));
  app.use('/files', require('./routes/files'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
