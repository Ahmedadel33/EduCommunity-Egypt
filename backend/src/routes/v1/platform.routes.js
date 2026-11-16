const express = require('express');
const platformController = require('../../controllers/platform.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.get('/stats', asyncHandler(platformController.stats));

module.exports = router;
