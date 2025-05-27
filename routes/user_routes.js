const express = require('express');
const router = express.Router();

const userController = require('../controller/user_controller');


router.route('/register').post(userController.register);
router.route('/send-mail-otp').post(userController.sendMailOtp);
router.route('/verify-mail-otp').post(userController.verifyMailOtp);
router.route('/login').post(userController.login);
router.route("/refresh-token").post(userController.refreshAccessToken);

module.exports = router;

// const path = require('path');
// const multer = require('multer');

// const session = require('express-session');
// const {SESSION_SECRET} = process.env;
// router.use(session({secret:SESSION_SECRET}));

// router.set('view engine', 'ejs');
// router.set('views', './views');

// router.use(express.static('public'));

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../public/images'));
//     },
//     filename: (req, file, cb) => {
//         const name = Date.now() + '-' + file.originalname;
//         cb(null, name);
//     }
// })

// const upload = multer({storage : storage});

// const auth = require('../middlewares/auth');



// router.get('/register',userController.registerLoad);
// router.post('/send_mail',userController.sendMail)
// router.post('/register',upload.single('image'),userController.register);

// router.get('/login',auth.isLogout,userController.loginLoad);
// router.post('/login',userController.login);
// router.get('/logout',auth.isLogin,userController.logout);

// router.get('/dashboard',auth.isLogin,userController.dashboardLoad);
