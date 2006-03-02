const express = require('express');
const passport = require('passport')
const router = express.Router();
const crime = require('../controller/crime');
const phoneVerifier = require('../__helper/sms-service-handler');


// routes
router.get('/all',crime.getAll);
router.get('/current/:id', crime.getCurrent);
router.get('/:id', crime.getById);
router.put('/:id', crime.update);
router.put('/current/:id', crime.update);
/* router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success', failureFlash: true,  failureFlash: 'Invalid crimename or password.' }), (err, req, res, next) => {
   
    if (err) { return next(err); }
}); */
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, crime, info) {
      if (err) { return next(err); }
      if (!crime) { 

       // console.log('login-failure')
        return res.send('login-failure'); 
      }
      req.logIn(crime, function(err) {
        if (err) { return next(err); }
            delete crime.password;
            delete crime.salt;
            delete crime.hash;
            req.session.save(() => {
              // res.redirect('/myprofile');
               res.status(200).send(crime) 
            })
      });
    })(req, res, next);
  });
router.post('/account-verify', crime.verifyAccount);
router.post('/phone-number-verify-check/:id',phoneVerifier.checkSMSVerificationStatus, crime.verificationStatus);
router.post('/phone-number-verify/:id',phoneVerifier.sendSMSVerification, crime.verifyNumber);
router.post('/join', crime.register);
router.put('/resetpwd/:id', crime.resetPassword);
router.delete('/:id', crime._delete);

module.exports = router; 