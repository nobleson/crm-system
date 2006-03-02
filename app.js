
const passport = require('passport');
const session = require('express-session');
const {format} = require('util');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./model/User');
const passwordUtils = require('./util/passwordUtils')
const Multer = require('multer');
const { sendBulkUploads } = require('./__helper/upload-handler');
const { Storage } = require('@google-cloud/storage');
const { v4: uuid } = require('uuid');


const storage = new Storage({ keyFilename: './Openfarm-47fbb7e56919.json' });
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

  // A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET || 'openfarm-storage');



// const MongoStore = require('connect-mongo')(session)
const dbConn = require('./db/mongoose')
const connection = dbConn.db
const PORT = process.env.PORT || 8080;



// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')(session);



/**
 * -------------- GENERAL SETUP ----------------
 */



// Create the Express application
var app = require('./express');

/* 

async function listBuckets() {
  try {
    const results = await storage.getBuckets();

    const [buckets] = results;

    console.log('Buckets:');
    buckets.forEach((bucket) => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
listBuckets(); */
// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

/**
 * -------------- SESSION SETUP ----------------
 */

/**
 * The MongoStore is used to store session data.  We will learn more about this in the post.
 * 
 * Note that the `connection` used for the MongoStore is the same connection that we are using above
 */

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' })
/**
 * See the documentation for all possible options - https://www.npmjs.com/package/express-session
 * 
 * As a brief overview (we will add more later): 
 * 
 * secret: This is a random string that will be used to "authenticate" the session.  In a production environment,
 * you would want to set this to a long, randomly generated string
 * 
 * resave: when set to true, this will force the session to save even if nothing changed.  If you don't set this, 
 * the app will still run but you will get a warning in the terminal
 * 
 * saveUninitialized: Similar to resave, when set true, this forces the session to be saved even if it is unitialized
 *
 * store: Sets the MemoryStore to the MongoStore setup earlier in the code.  This makes it so every new session will be 
 * saved in a MongoDB database in a "sessions" table and used to lookup sessions
 * 
 * cookie: The cookie object has several options, but the most important is the `maxAge` property.  If this is not set, 
 * the cookie will expire when you close the browser.  Note that different browsers behave slightly differently with this
 * behaviour (for example, closing Chrome doesn't always wipe out the cookie since Chrome can be configured to run in the
 * background and "remember" your last browsing session)
 */
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));


/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

/**
 * Notice that these middlewares are initialized after the `express-session` middleware.  This is because
 * Passport relies on the `express-session` middleware and must have access to the `req.session` object.
 * 
 * passport.initialize() - This creates middleware that runs before every HTTP request.  It works in two steps: 
 *      1. Checks to see if the current session has a `req.session.passport` object on it.  This object will be
 *          
 *          { user: '<Mongo DB user ID>' }
 * 
 *      2.  If it finds a session with a `req.session.passport` property, it grabs the User ID and saves it to an 
 *          internal Passport method for later.
 *  
 * passport.session() - This calls the Passport Authenticator using the "Session Strategy".  Here are the basic
 * steps that this method takes:
 *      1.  Takes the MongoDB user ID obtained from the `passport.initialize()` method (run directly before) and passes
 *          it to the `passport.deserializeUser()` function (defined above in this module).  The `passport.deserializeUser()`
 *          function will look up the User by the given ID in the database and return it.
 *      2.  If the `passport.deserializeUser()` returns a user object, this user object is assigned to the `req.user` property
 *          and can be accessed within the route.  If no user is returned, nothing happens and `next()` is called.
 */
app.use(passport.initialize());
app.use(passport.session());

// Need to require the entire Passport config module so app.js knows about it
/**
 * This function is called when the `passport.authenticate()` method is called.
 * 
 * If a user is found an validated, a callback is called (`cb(null, user)`) with the user
 * object.  The user object is then serialized with `passport.serializeUser()` and added to the 
 * `req.session.passport` object. 
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
function(username, password, cb) {
    User.findOne({ email: username })
        .then((user) => {

            if (!user) { return cb(null, false) }
            
            // Function defined at bottom of app.js
            const isValid = passwordUtils.validPassword(password, user.hash, user.salt);
            
            if (isValid) {
                return cb(null, user);
            } else {
                return cb(null, false);
            }
        })
        .catch((err) => {   
            cb(err);
        });
}));

/**
* This function is used in conjunction with the `passport.authenticate()` method.  See comments in
* `passport.use()` above ^^ for explanation
*/
passport.serializeUser(function(user, cb) {
cb(null, user.id);
});

/**
* This function is used in conjunction with the `app.use(passport.session())` middleware defined below.
* Scroll down and read the comments in the PASSPORT AUTHENTICATION section to learn how this works.
* 
* In summary, this method is "set" on the passport object and is passed the user ID stored in the `req.session.passport`
* object later on.
*/
passport.deserializeUser(function(id, cb) {
User.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
});
});


/**
 * -------------- ROUTES ----------------
 */
app.use((req, res, next) => {
  var status = req.isAuthenticated() ? 'logged-in' : 'logged-out';
/*   console.log('status:', status, '\n',
  ); */
  console.log(
    'status:', status, '\n',
    //req.sessionStore,
   //req.sessionID,
    //req.session
  );
  res.cookie('userLoggedStatus', status)
  next();
});
console.log('Project Env', process.env.NODE_ENV);

/* app.get('/logout-user', function(req, res){
  req.logout();
  res.redirect('/');
}); */

 /**
  * -------------- ROUTES ----------------
  */
 app.use("/", require('./router'));


app.use('/member', require('./route/User'))
app.use('/api/page', require('./route/Page'))
app.use('/api/post', require('./route/Post'))
app.use('/api/market/region', require('./route/MarketRegion'))
app.use('/api/market', require('./route/Market'))
app.use('/api/payment', require('./route/Payment'))
app.use('/api/reaction/likes', require('./route/ProductLikes'))
app.use('/api/tag', require('./route/Tag'))
app.use('/api/product-review', require('./route/ProductReview'))
app.use('/api/product-category', require('./route/ProductCategory'))
app.use('/api/product-meta', require('./route/ProductMeta')) 
app.use('/api/product', require('./route/Product'))
app.use('/api/category', require('./route/Category'))
app.use('/api/cart', require('./route/Cart'))
app.use('/api/store', require('./route/Store'))
app.use('/api/cart-item', require('./route/CartItem'))

// Process the file upload and upload to Google Cloud Storage.
app.post('/blkupload', multer.array('image'), sendBulkUploads, (req, res, next) => {
  
  //console.log(req.files) // you will get the uploaded files name and url here
  
  res.status(200).json({ urls: req.files });
  
})

app.post('/upload', multer.single('cover'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
  
    // Create a new blob in the bucket and upload the file data.

    const gcsname = uuid() + '-' + req.file.originalname
    const blob = bucket.file(gcsname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
  
    blobStream.on('error', (err) => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      //console.log('publicUrl', publicUrl)
      res.status(200).send({ url:publicUrl });
    });
  
    blobStream.end(req.file.buffer);
  });
  app.post('/upload-profile', multer.single('profile'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
 

    // Create a new blob in the bucket and upload the file data.
    const gcsname = uuid() + '-' + req.file.originalname
    const blob = bucket.file('profile-photos/' + gcsname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
  
    blobStream.on('error', (err) => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      //console.log('publicUrl', publicUrl)
      res.status(200).send({ url:publicUrl });
    });
  
    blobStream.end(req.file.buffer);
  });
  app.post('/upload-post', multer.single('image'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
 

    // Create a new blob in the bucket and upload the file data.
    const gcsname = uuid() + '-' + req.file.originalname
    const blob = bucket.file('product-photos/' + gcsname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
  
    blobStream.on('error', (err) => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      //console.log('publicUrl', publicUrl)
      res.status(200).send({ url:publicUrl });
    });
  
    blobStream.end(req.file.buffer);
  });
// Process the file upload and upload to Google Cloud Storage.

/**
 * -------------- SERVER ----------------
 */

// Start the server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  // [END gae_node_request_example]
  
  module.exports = app;
  
