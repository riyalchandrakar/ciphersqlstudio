const express = require('express');
const {
  getMyAttempts,
  getAttemptByAssignment,
  saveQuery,
} = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, getMyAttempts);
router.get('/:assignmentId', protect, getAttemptByAssignment);
router.patch('/:assignmentId/save', protect, saveQuery);

module.exports = router;
