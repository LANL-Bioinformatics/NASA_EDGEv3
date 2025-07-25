const router = require('express').Router();
const { validationRules: updateValidationRules, validate: updateValidate } = require('../../edge-api/validations/upload-update-validator');
const {
  updateOne,
} = require('../controllers/nasa-admin-controller');

/**
 * @swagger
 * /api/admin/nasa/uploads/{code}:
 *   put:
 *     summary: Update upload
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: test
 *        description: The upload unique code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/updateUpload'
 *     responses:
 *       200:
 *         description: Action successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionSuccessful'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionFailed'
 *       500:
 *         description: API server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/serverError'
 */
router.put('/nasa/uploads/:code', updateValidationRules(), updateValidate, async (req, res) => {
  await updateOne(req, res);
});

module.exports = router;
