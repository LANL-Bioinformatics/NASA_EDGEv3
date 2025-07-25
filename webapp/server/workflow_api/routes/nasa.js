const router = require('express').Router();
const { validationRules: addValidationRules, validate: addValidate } = require('../../edge-api/validations/upload-validator');
const { validationRules: updateValidationRules, validate: updateValidate } = require('../../edge-api/validations/upload-update-validator');
const {
  addOne, updateOne,
} = require('../controllers/nasa-controller');

/**
 * @swagger
 * /api/auth-user/nasa/uploads:
 *   post:
 *     summary: Create new upload
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               upload:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/addUpload'
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
router.post('/nasa/uploads', addValidationRules(), addValidate, async (req, res) => {
  await addOne(req, res);
});

/**
 * @swagger
 * /api/auth-user/uploads/{code}:
 *   put:
 *     summary: Update upload
 *     tags: [AuthUser]
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
