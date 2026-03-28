const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/quizController');

router.post('/start',  auth, ctrl.start);
router.post('/answer', auth, ctrl.answer);
router.post('/finish', auth, ctrl.finish);
router.post('/quit',   auth, ctrl.quit);

module.exports = router;
