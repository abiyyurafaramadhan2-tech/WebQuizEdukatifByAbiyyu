const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/userController');

router.get('/profile', auth, ctrl.getProfile);

module.exports = router;
