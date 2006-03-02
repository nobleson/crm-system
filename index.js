const express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose   = require('mongoose');
const PORT = process.env.PORT || 8080;
const router = require('express').Router();
const path = __dirname + '/templates/';
app.use(bodyParser.urlencoded({ extended: true,limit: '100mb' })); 
app.use(bodyParser.json({limit: '50mb'}));
app.use(function(req, res, next) { 
res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS"); 
res.header('Access-Control-Allow-Credentials', true);
res.header("Access-Control-Allow-Origin", "*"); 
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
next();
 });
app.use('/static/', express.static(__dirname + '/static/'));
app.use('/static/css/', express.static(__dirname + '/static/css/'));
app.use('/static/fonts/', express.static(__dirname + '/static/fonts/'));
app.use('/static/icons-reference/', express.static(__dirname + '/static/icons-reference/'));
app.use('/static/img/', express.static(__dirname + '/static/img/'));
app.use('/static/js/', express.static(__dirname + '/static/js/'));
app.use('/static/js/custom/', express.static(__dirname + '/static/js/custom/'));
app.use('/static/js/vendor/', express.static(__dirname + '/static/js/vendor/'));
app.use('/static/js/vendor/bootsrap/css/', express.static(__dirname + '/static/js/vendor/bootsrap/css/'));
app.use('/static/js/vendor/bootsrap/js/', express.static(__dirname + '/static/js/vendor/bootsrap/js/'));
app.use('/static/js/vendor/chart.js/', express.static(__dirname + '/static/js/vendor/chart.js/'));
app.use('/static/js/vendor/font-awesome/css/', express.static(__dirname + '/static/js/vendor/font-awesome/css/'));
app.use('/static/js/vendor/font-awesome/fonts/', express.static(__dirname + '/static/js/vendor/font-awesome/fonts/'));
app.use('/static/js/vendor/jquery/', express.static(__dirname + '/static/js/vendor/jquery/'));
app.use('/static/js/vendor/jquery-validation/', express.static(__dirname + '/static/js/vendor/jquery-validation/'));
app.use('/static/js/vendor/jquery-validation/localization/', express.static(__dirname + '/static/js/vendor/jquery-validation/localization/'));
app.use('/static/js/vendor/jquery-cookie/', express.static(__dirname + '/static/js/vendor/jquery-cookie/'));
app.use('/static/js/vendor/popper.js/', express.static(__dirname + '/static/js/vendor/poper.js/'));
app.use('/static/js/vendor/popper.js/esm/', express.static(__dirname + '/static/js/vendor/poper.js/esm/'));
app.use('/static/js/vendor/popper.js/umd/', express.static(__dirname + '/static/js/vendor/poper.js/umd/'));

app.get("/", function(req,res){
      res.sendFile(path + "login.html");
   });

   app.get("/dashboard/", function(req,res){
      res.sendFile(path + "dashboard.html");
   });
  app.get("/manage-crime/", function(req,res){
      res.sendFile(path + "crime_mgt_template.html");
   });

 
app.get("/crime_form/", function(req,res){
      res.sendFile(path + "crime_form.html");
   });
app.get("/crime_table/", function(req,res){
      res.sendFile(path + "crime_table.html");
   });
 app.get("/crime_view/", function(req,res){
      res.sendFile(path + "crime_view.html");
   });


 app.get("/model_arima/", function(req,res){
      res.sendFile(path + "model_arima.html");
   });

 app.get("/model_mlp/", function(req,res){
      res.sendFile(path + "model_mlp.html");
   });

 app.get("/model_ann/", function(req,res){
      res.sendFile(path + "model_ann.html");
   });

 app.get("/analytics_arima/", function(req,res){
      res.sendFile(path + "analytics_arima.html");
   });

 app.get("/analytics_mlp/", function(req,res){
      res.sendFile(path + "analytics_mlp.html");
   });

 app.get("/analytics_ann/", function(req,res){
      res.sendFile(path + "analytics_ann.html");
   });

 app.use('/crime', require('./routes/crime'))
// app.use('/user', require('./routes/user'))

app.use('templates/', express.static(__dirname + '/templates/'));
var mongoURL = 'mongodb+srv://crmdbUser:4PZca4YNfBxbgMrf@cluster0.6ysvc.gcp.mongodb.net/crimedb?retryWrites=true&w=majority'

mongoose.Promise = global.Promise;

// Connecting to the database
 mongoose.connect(mongoURL, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false , useUnifiedTopology: true }).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

  
// Start the server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  // [END gae_node_request_example]
  
  module.exports = app;