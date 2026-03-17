const express = require('express');
const router  = express.Router();

const { createLink, getMyLinks, accessByToken, revokeLink, deleteLink } = require('../controllers/accessLink.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/shared/:token', accessByToken);
router.post('/',             protect, authorize('patient'), createLink);
router.get('/',              protect, authorize('patient'), getMyLinks);
router.put('/:id/revoke',   protect, authorize('patient'), revokeLink);
router.delete('/:id',        protect, authorize('patient'), deleteLink);

module.exports = router;