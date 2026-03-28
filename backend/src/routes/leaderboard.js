const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/leaderboardController');

router.get('/', auth, ctrl.getGlobal);

module.exports = router;
