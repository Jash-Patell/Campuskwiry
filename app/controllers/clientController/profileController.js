const User = require("../../models/clientModel/userSchema");

function profileController() {
  return {
//!display profile page
    displayprofilepage: function (req, res) {
      var payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
      };

      res.status(200).render("client/profilePage", payload);
    },

//!display user profile page
    displayuserprofile: async function (req, res) {
      var payload = await getPayload(req.params.username, req.session.user);
      res.status(200).render("client/profilePage", payload);
    },
//!displayuserreplies
    displayuserreplies: async function(req, res) {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies";
    
    res.status(200).render("client/profilePage", payload);
    },
    
//! Followers and Following tabs 
    //following tab
    followingtabs: async function(req, res){
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";
    
    res.status(200).render("client/followersAndFollowing", payload);
    },
    //followers tab 
    followerstabs: async function(req, res){
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";
    
    res.status(200).render("client/followersAndFollowing", payload);
    }
  };
}

//!getpayload function for user profile
async function getPayload(username, userLoggedIn) {
  var user = await User.findOne({ username: username });

  if (user == null) {
    user = await User.findById(username);

    if (user == null) {
      return {
        pageTitle: "User not found",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}
module.exports = profileController;