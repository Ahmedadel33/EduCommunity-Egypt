const platformService = require('../services/platform.service');
const { sendSuccess } = require('../utils/apiResponse');

async function stats(req, res) {
  const result = await platformService.stats();
  return sendSuccess(res, { stats: result });
}

module.exports = { stats };
