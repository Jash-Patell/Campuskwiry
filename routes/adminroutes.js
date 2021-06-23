const express = require('express')
const router = express.Router()
const middlerware = require('../app/config/adminmiddelware')//middleware for authentication
const authController = require('../app/controllers/adminController/authController')
const dashboardController = require('../app/controllers/adminController/dashboardController')
const modertorController = require('../app/controllers/adminController/modertorController')
const userController = require('../app/controllers/adminController/userController')
const spamController = require('../app/controllers/adminController/spamController')
const settingController = require('../app/controllers/adminController/settingController')
const questionsController = require('../app/controllers/clientController/questionsController')

//! Auth Routes
router.get('/adminlogin', authController().login)
router.post('/adminlogin', authController().postlogin)
router.get('/logout', authController().logout)

//! Dashboar Routes
router.get("/dashboard", middlerware.requireLogin, dashboardController().index)
router.get("/dashboard/home", middlerware.requireLogin, dashboardController().dashboard)

//! Moderator Routes
router.get("/moderator", middlerware.requireLogin, modertorController().index)

//! Spam Routes
router.get("/spam", middlerware.requireLogin, spamController().index)
router.get("/spam/getspam", middlerware.requireLogin, spamController().getSpamPosts)
router.delete('/spam/:id', middlerware.requireLogin, spamController(). deleteSpamPost)

//! User Routes
router.get("/userManagment", middlerware.requireLogin, userController().index)
router.get("/userManagment/userdetail", middlerware.requireLogin, userController().userdetail)

//! Setting Routes
router.get("/setting", middlerware.requireLogin, settingController().index)


module.exports = router