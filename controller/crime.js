const crimeService = require('../service/crime');


 exports.register = function(req, res, next) {
    crimeService.create(req.body)
    .then((data) => res.status(200).send(data))
    .catch(err => next(err));
}
  
exports.getAll = function(req, res, next) {
    crimeService.getAll()
        .then(crimes => res.json(crimes))
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