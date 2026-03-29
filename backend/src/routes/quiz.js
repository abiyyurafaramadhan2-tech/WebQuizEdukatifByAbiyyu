// QuizGenius AI — Route Handler
const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/quizController');

/**
 * Kenapa saya buat begini? 
 * Supaya kalau di HP kamu "Token Expired" atau loginnya bermasalah, 
 * kuisnya TIDAK LANGSUNG ERROR, tapi tetap bisa dicoba.
 */

router.post('/start', (req, res, next) => {
  // Cek apakah ada token, kalau ada pake auth, kalau nggak langsung lanjut
  if (req.headers.authorization) {
    return auth(req, res, next);
  }
  next();
}, ctrl.start);

router.post('/answer', auth, ctrl.answer);
router.post('/finish', auth, ctrl.finish);
router.post('/quit',   auth, ctrl.quit);

module.exports = router;
