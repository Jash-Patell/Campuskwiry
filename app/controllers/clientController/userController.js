const User = require('../../models/clientModel/userSchema');
const fs = require("fs");
const path = require("path")
const Notification = require('../../models/clientModel/notificationSchema');

function userController() {
  return {
//! Search user 
      searchuser: function(req, res) {
    // search user using regex
    var searchObj = req.query;
    if(req.query.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" }},
                { lastName: { $regex: req.query.search, $options: "i" }},
                { username: { $regex: req.query.search, $options: "i" }},
            ]
        }
    }
    User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    },

//! Follow user
    followuser: async function (req, res) {
      var userId = req.params.userId;
      var user = await User.findById(userId);
      if (user == null) return res.sendStatus(404);
      var isFollowing =
        user.followers && user.followers.includes(req.session.user._id);
      var option = isFollowing ? "$pull" : "$addToSet";
      //following
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { [option]: { following: userId } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });
      //followers
      User.findByIdAndUpdate(userId, {
        [option]: { followers: req.session.user._id },
      }).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });
      
      // follw user notification
      if(!isFollowing) {
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
      }
      
      res.status(200).send(req.session.user);
    },

//! Following and Followers tab in profile page
    //following tab
    getfollowingtab : function(req, res) {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    },
    //followers tab
    getfollowerstab : function(req, res) {
        User.findById(req.params.userId)
        .populate("followers")
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    },

//! Profile Picture and Cover Picture
    //get profile and cover pic
    getCoverandProfilepic : function(req, res){
      res.sendFile(path.join(__dirname, `../../../uploads/images/${req.params.path}`));
    },
    //post profile pic 
    postProfilepic : function(req, res){
      if(!req.file) {
        console.log("No file uploaded with ajax request.");
        return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true });
        res.sendStatus(204);
    })
    },
    //post cover pic   
    postCoverpic : function(req, res){
      if(!req.file) {
        console.log("No file uploaded with ajax request.");
        return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true });
        res.sendStatus(204);
    })
    }

  };
}

module.exports = userController;
