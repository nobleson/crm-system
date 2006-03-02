const express = require('express');
const router = express.Router();
const crime = require('../controller/crime');


// routes
router.get('/',crime.getAll);
router.get('/:id', crime.getById);
router.put('/:id', crime.update);
router.post('/create', crime.register);
router.delete('/:id', crime._delete);

module.exports = router; 