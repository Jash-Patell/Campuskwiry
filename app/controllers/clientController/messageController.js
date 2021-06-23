const User = require("../../models/clientModel/userSchema");
const Chat = require("../../models/clientModel/chatSchema");// for creating person to person chat and also group chat
const Message = require("../../models/clientModel/messageSchema");// for sending and receving messages
const mongoose = require("mongoose");
const Notification = require("../../models/clientModel/notificationSchema");

function messageController() {
  return {
    //! All message controller logic below
    // display inbox page
    displayinboxpage: function (req, res) {
      var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
      };
      res.status(200).render("client/inboxPage", payload);
    },
    // display group chat page
    displaygroupchatpage: function (req, res) {
      var payload = {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
      };
      res.status(200).render("client/newMessage", payload);
    },
    // create chat and modefing chat schema
    createchat: function (req, res) {
      //error handeling using params user data form client side with 400 bad status
      if (!req.body.users) {
        console.log("Users param not sent with request");
        return res.sendStatus(400);
      }
      // convert string data from ajax request in to json formet
      var users = JSON.parse(req.body.users);
      //error handeling checking user length form ajax request with 400 bad status
      if (users.length == 0) {
        console.log("Users array is empty");
        return res.sendStatus(400);
      }
      // push over self in chat schema
      users.push(req.session.user);
      // true groupchat in schema if people moe than 2
      var chatData = {
        users: users,
        isGroupChat: true,
      };
      // create chat in chat schema
      Chat.create(chatData)
        .then((results) => res.status(200).send(results))
        .catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
    },
    // display chats
    displaychats: function (req, res) {
      Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
        .populate("users")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          if (
            req.query.unreadOnly !== undefined &&
            req.query.unreadOnly == "true"
          ) {
            results = results.filter(
              (r) =>
                r.latestMessage &&
                !r.latestMessage.readBy.includes(req.session.user._id)
            );
          }

          results = await User.populate(results, {
            path: "latestMessage.sender",
          });
          res.status(200).send(results);
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
    },
    // diplay messages using chatid
    displaymessagebox: async function (req, res) {
      var userId = req.session.user._id;
      var chatId = req.params.chatId;
      var isValidId = mongoose.isValidObjectId(chatId);

      var payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
      };

      if (!isValidId) {
        payload.errorMessage =
          "Chat does not exist or you do not have permission to view it.";
        return res.status(200).render("client/chatPage", payload);
      }

      var chat = await Chat.findOne({
        _id: chatId,
        users: { $elemMatch: { $eq: userId } },
      }).populate("users");

      if (chat == null) {
        // Check if chat id is really user id
        var userFound = await User.findById(chatId);

        if (userFound != null) {
          // get chat using user id
          chat = await getChatByUserId(userFound._id, userId);
        }
      }

      if (chat == null) {
        payload.errorMessage =
          "Chat does not exist or you do not have permission to view it.";
      } else {
        payload.chat = chat;
      }

      res.status(200).render("client/chatPage", payload);
    },
    chatname: async function (req, res) {
      Chat.findByIdAndUpdate(req.params.chatId, req.body)
      .then(results => res.sendStatus(204))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    },
    getchatname: async function (req, res) {
      Chat.findOne({ _id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } }})
      .populate("users")
      .then(results => res.status(200).send(results))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    },
//! send messages controller
    sendmessages: async function (req, res) {
      if(!req.body.content || !req.body.chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    Message.create(newMessage)
    .then(async message => {
        message = await message.populate("sender").execPopulate();
        message = await message.populate("chat").execPopulate();
        message = await User.populate(message, { path: "chat.users" });
        
        var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch(error => console.log(error));
        // call insertNotifications function
        insertNotifications(chat, message);

        res.status(201).send(message);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    },
    // load messeges 
    loadoldmesseges: async function(req, res){
      Message.find({ chat: req.params.chatId })
      .populate("sender")
      .then(results => res.status(200).send(results))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    },
     // msg realtime Badge
     msgbadge: function (req, res){
      Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.session.user._id } })
      .then(() => res.sendStatus(204))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    }
  };
}

// two user chat each other logic filter and udate user schema
function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}

// insert notifcation function
function insertNotifications(chat, message) {
  chat.users.forEach(userId => {
      if(userId == message.sender._id.toString()) return;

      Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
  })
}

module.exports = messageController;