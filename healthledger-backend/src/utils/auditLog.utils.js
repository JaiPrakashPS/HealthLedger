const AuditLog = require('../models/AuditLog.model');

const logAction = async ({ actor, actorRole, action, resource, resourceId, ipAddress, userAgent, details, success = true }) => {
  try {
    await AuditLog.create({ actor, actorRole, action, resource, resourceId, ipAddress, userAgent, details, success });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAction };