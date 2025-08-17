const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.post('/find' , userController.findUser);
router.post('/create' , userController.createUser);
router.post('/forgotpassword', userController.forgotPassword);
router.get('/resetpassword/:id', userController.resetPassword);
router.patch('/updatepassword', userController.updateUser);
module.exports= router;