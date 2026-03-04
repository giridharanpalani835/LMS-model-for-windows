const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeaderboard, getMyRank } = require('../controllers/leaderboardController');

router.get('/', protect, getLeaderboard);
router.get('/me', protect, getMyRank);

module.exports = router;
