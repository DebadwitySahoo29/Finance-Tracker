const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;


"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjczODFlNzQ5YmE4MmViNWJjZDBiNCIsImlhdCI6MTc2NDE3Nzk1MCwiZXhwIjoxNzY2NzY5OTUwfQ.D8Pk8EjUFlbqVvK0UbDU_Mj4qRQffpibhWCYFxqOgrc"