const crimeService = require('../service/crime');
 

 exports.register = function(req, res, next) {
    const saltHash = passwordUtils.genPassword(req.body.password);
    crimeService.create(req.body, {salt: saltHash.salt,hash: saltHash.hash })
    .then((data) => res.status(200).send(data))
    .catch(err => next(err));
}
exports.verifyAccount = function(req, res, next) {
    crimeService.verifyAccount(req.body.email) 
    .then((data) => res.status(200).send(data))
    .catch(err => next(err));
}
exports.verificationStatus = function(req, res, next) {
    crimeService.verifyNumber(req.verification_check) 
    .then((data) => res.status(200).send(data))
    .catch(err => next(err));
}
exports.verifyNumber = function(req, res, next) {
    let verifyService = { phoneNumber: req.body.phoneNumber, sid:req.sid}
    crimeService.verifyNumber(verifyService) 
    .then((data) => res.status(200).send(data))
    .catch(err => next(err));
}

exports.resetPassword = function(req, res, next) {
    crimeService.reset(req.params.id, req.body)
        .then((data) => {
            req.logout()
            res.status(200).send(data)
        })
        .catch(err => next(err));
}
exports.getAll = function(req, res, next) {
    crimeService.getAll()
        .then(crimes => res.json(crimes))
        .catch(err => next(err)); 
}

exports.getCurrent = function(req, res, next) {
    crimeService.getById(req.uid)
        .then(crime => crime ? res.json(crime) : res.sendStatus(404))
        .catch(err => next(err));
} 

exports.getById = function(req, res, next) {
    crimeService.getById(req.params.id)
        .then(crime => crime ? res.json(crime) : res.sendStatus(404))
        .catch(err => next(err));
}

exports.update = function(req, res, next) {
    crimeService.update(req.params.id,  req.body)
        .then((data) => res.send(data))
        .catch(err => next(err));
}

exports._delete = function(req, res, next) {
    crimeService.delete(req.params.id)
        .then(() => res.json({status: 'Ok'}))
        .catch(err => next(err));
} 