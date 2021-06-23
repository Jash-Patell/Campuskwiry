//! Client routes
const express = require('express')
const router = express.Router()
const middlerware = require('../app/config/clientmiddleware')//middleware for authentication
const multer = require('multer')//middleware for image upload
const upload = multer( { dest: "uploads/" } )
const authController = require('../app/controllers/clientController/authController')
const homeController = require('../app/controllers/clientController/homeController')
const questionsController = require('../app/controllers/clientController/questionsController')
const answerController = require('../app/controllers/clientController/answersController')
const profileController = require('../app/controllers/clientController/profileController')
const userController = require('../app/controllers/clientController/userController')
const searchController = require('../app/controllers/clientController/searchController')
const messageController = require('../app/controllers/clientController/messageController')
const notificationController = require('../app/controllers/clientController/notificationController')


//! Home routes
router.get('/', middlerware.requireLogin, homeController().home)

//! Auth routes
router.get('/login', authController().login)
router.post('/login', authController().postlogin)
router.get('/register', authController().register)
router.post('/register', authController().postregister)
router.get('/logout', authController().logout)

//! Questions (posts) routes
router.get('/questions', middlerware.requireLogin, questionsController().displayquestions)
//pick question in to popup model
router.get('/questions/:id', middlerware.requireLogin, questionsController().displayquestionmodel)
router.post('/questions', middlerware.requireLogin, questionsController().postquestions)

//! Likes button routes    
router.put('/questions/:id/like', middlerware.requireLogin, questionsController().postLikes)
//! Dislike button routes
router.put('/questions/:id/dislike', middlerware.requireLogin, questionsController().postdisLikes)
//! Reasked question routes
router.post('/questions/:id/reasked', middlerware.requireLogin, questionsController().postreasked)

//! Delete button routes
router.delete('/questions/:id', middlerware.requireLogin, questionsController().deletepost)

//! Pin and Unpin routes
router.put('/questions/:id', middlerware.requireLogin, questionsController().pinPost)

//! Answer(one post and their replay) page routes (problem)
router.get('/answers/:id', middlerware.requireLogin, answerController().displayanswers)

//! User Profile routes
router.get('/profile', middlerware.requireLogin, profileController().displayprofilepage)
router.get('/profile/:username', middlerware.requireLogin, profileController().displayuserprofile)
router.get('/profile/:username/replies', middlerware.requireLogin, profileController().displayuserreplies)
//image upload routes
router.get('/uploads/images/:path', middlerware.requireLogin, userController().getCoverandProfilepic)
router.post('/uploads/profilePicture', middlerware.requireLogin, upload.single("croppedImage"), userController().postProfilepic)
router.post('/uploads/coverPhoto', middlerware.requireLogin, upload.single("croppedImage"), userController().postCoverpic)

//! Follow following routes
router.get('/users', middlerware.requireLogin, userController().searchuser)
router.put('/users/:userId/follow', middlerware.requireLogin, userController().followuser)
//followers and following tabs
router.get('/profile/:username/following', middlerware.requireLogin, profileController().followingtabs)
router.get('/profile/:username/followers', middlerware.requireLogin, profileController().followerstabs)
//get followers and following usercontroller
router.get('/users/:userId/following', middlerware.requireLogin, userController().getfollowingtab)
router.get('/users/:userId/followers', middlerware.requireLogin, userController().getfollowerstab)

//! Search Page Routes
router.get('/search', middlerware.requireLogin, searchController().searchpage)
router.get('/search/:selectedTab', middlerware.requireLogin, searchController().searchtabs)

//! Massages Page Routes 
router.get('/messages', middlerware.requireLogin, messageController().displayinboxpage)
router.get('/messages/new', middlerware.requireLogin, messageController().displaygroupchatpage)
//create chats and group chats
router.post('/chats', middlerware.requireLogin, messageController().createchat)
router.get('/chats', middlerware.requireLogin, messageController().displaychats)
router.put('/chats/:chatId', middlerware.requireLogin, messageController().chatname)
router.get('/chats/:chatId', middlerware.requireLogin, messageController().getchatname)
//display messages page
router.get('/messages/:chatId', middlerware.requireLogin, messageController().displaymessagebox)
router.get('/chats/:chatId/messages', middlerware.requireLogin, messageController().loadoldmesseges)
//send messeages
router.post('/sendmessages', middlerware.requireLogin, messageController().sendmessages)

//!Notification Routes
//notification page
router.get('/notifications',middlerware.requireLogin, notificationController().displaynotificationpage)
//receive notification
router.get('/allnotifications',middlerware.requireLogin, notificationController().sendnotification)
//readed or notreaded notification
router.put("/notifications/:id/markAsOpened", middlerware.requireLogin, notificationController().activeordeactive)
// double check button
router.put("/notifications/markAsOpened", middlerware.requireLogin, notificationController().doublecheckbtn)
// notification realtime Badge
router.get("/notifications/latest", middlerware.requireLogin, notificationController().notificationbadge)
// msg realtime Badge
router.put("/chats/:chatId/messages/markAsRead", middlerware.requireLogin, messageController().msgbadge)


module.exports = router