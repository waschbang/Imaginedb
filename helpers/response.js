function success(res, message, data = {}) {
  return res.json({ status: 'success', message, data });
}

function error(res, message, code = 500) {
  return res.status(code).json({ status: 'error', message });
}

module.exports = { success, error };
