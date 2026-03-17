const { nanoid }   = require('nanoid');
const AccessLink   = require('../models/AccessLink.model');
const Record       = require('../models/Record.model');
const User         = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { logAction } = require('../utils/auditLog.utils');

const createLink = async (req, res) => {
  try {
    const { recordIds, sharedWith, permission, expiryDays } = req.body;

    const records = await Record.find({
      _id: { $in: recordIds },
      patient: req.user.id,
      isDeleted: false,
    });

    if (records.length !== recordIds.length) {
      return res.status(400).json({ success: false, message: 'One or more records not found' });
    }

    const token     = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (Number(expiryDays) || 7));

    const link = await AccessLink.create({
      patient:    req.user.id,
      records:    recordIds,
      token,
      sharedWith,
      permission: permission || 'view',
      expiresAt,
    });

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${token}`;

    await Notification.create({
      user:    req.user.id,
      type:    'access_granted',
      title:   'Access Link Created',
      message: `Secure link created for ${sharedWith.name || sharedWith.email}. Expires in ${expiryDays || 7} days.`,
    });

    await logAction({
      actor: req.user.id, actorRole: 'patient',
      action: 'create_link', resource: 'AccessLink', resourceId: link._id,
      details: { sharedWith: sharedWith.email },
    });

    res.status(201).json({
      success: true,
      message: 'Access link created successfully',
      data: { link, shareUrl },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLinks = async (req, res) => {
  try {
    const links = await AccessLink.find({ patient: req.user.id })
      .populate('records', 'title type fileUrl recordDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { links } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const accessByToken = async (req, res) => {
  try {
    const link = await AccessLink.findOne({ token: req.params.token })
      .populate('records', 'title type fileUrl fileType fileSize fileName recordDate doctor hospital status notes tags')
      .populate('patient', 'name bloodGroup dateOfBirth gender phone');

    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or expired link' });
    }
    if (link.isRevoked) {
      return res.status(403).json({ success: false, message: 'This link has been revoked' });
    }
    if (new Date() > link.expiresAt) {
      return res.status(403).json({ success: false, message: 'This link has expired' });
    }

    link.viewCount     += 1;
    link.lastAccessedAt = new Date();
    link.accessLog.push({ ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    await link.save();

    await Notification.create({
      user:    link.patient._id,
      type:    'access_granted',
      title:   'Records Accessed',
      message: `${link.sharedWith.name || link.sharedWith.email} viewed your medical records.`,
    });

    res.json({
      success: true,
      data: {
        patient:    link.patient,
        records:    link.records,
        permission: link.permission,
        expiresAt:  link.expiresAt,
        sharedWith: link.sharedWith,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const revokeLink = async (req, res) => {
  try {
    const link = await AccessLink.findOne({ _id: req.params.id, patient: req.user.id });
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    link.isRevoked = true;
    await link.save();

    await Notification.create({
      user:    req.user.id,
      type:    'link_revoked',
      title:   'Access Revoked',
      message: `Access link for ${link.sharedWith.name || link.sharedWith.email} has been revoked.`,
    });

    await logAction({
      actor: req.user.id, actorRole: 'patient',
      action: 'revoke_link', resource: 'AccessLink', resourceId: link._id,
    });

    res.json({ success: true, message: 'Access link revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLink = async (req, res) => {
  try {
    await AccessLink.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLink, getMyLinks, accessByToken, revokeLink, deleteLink };