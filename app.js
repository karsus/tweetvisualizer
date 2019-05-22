var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var documents = require('./models/documents');
var indexMgmt = require('./models/indexmanagement');
var app = express();
app.listen(8080);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);
app.get("/api/results", function(req, res) {
    sendDataUI(req, res);
});

sendDataUI = function(req, res) {
    var tag = req.query.tag;
    var lfilter = req.query.lfilter;
    var tagObj;
    if (tag) {
        console.log(tag);
        tagObj = JSON.parse(tag);
    }
    documents.getSearchResults(lfilter,tagObj).then(function(results) {
        res.json(results);
    }, function(err) {
        console.log(err);
        res.send("server error");
    });
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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

app.on('listening', function() {
    indexMgmt.manageIndices();
});
module.exports = app;
