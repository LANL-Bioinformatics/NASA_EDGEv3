const fs = require('fs');
const Upload = require('../../edge-api/models/upload');
const User = require('../../edge-api/models/user');
const { updateUpload } = require('../../edge-api/utils/upload');
const logger = require('../../utils/logger');
const config = require('../../config');

const sysError = config.APP.API_ERROR;

// Update upload
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/admin/nasa/uploads/${req.params.code} update`);

    const query = { 'status': { $ne: 'delete' }, code: { $eq: req.params.code } };
    const upload = await updateUpload(query, req);

    if (!upload) {
      logger.error(`upload ${req.params.code} not found or access denied.`);
      return res.status(400).json({
        error: { upload: `upload ${req.params.code} not found or access denied` },
        message: 'Action failed',
        success: false,
      });
    }
    // If the upload status is 'delete', we need to delete the file and link
    if (upload.status === 'delete') {
      // find user
      const user = await User.findOne({ email: upload.owner });
      if (!user) {
        throw new Error(`User not found: ${upload.owner}`);
      }
      // user folder in upload directory
      const userUploadDir = `${config.IO.UPLOADED_USER_DIR}/${user.id}`;
      const target = `${userUploadDir}/${upload.name}`;

      // delete old upload and link
      fs.unlink(target, () => {
      });
      const oldpath = `${config.IO.UPLOADED_FILES_DIR}/${upload.code}`;
      fs.unlink(oldpath, () => {
      });
      await Upload.deleteOne({ code: upload.code });
    }

    return res.send({
      upload,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`Admin update upload failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  updateOne,
};
