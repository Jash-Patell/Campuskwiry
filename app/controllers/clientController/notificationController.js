const Notification = require("../../models/clientModel/notificationSchema");

function notificationController() {
  return {
    //! notification page display
    displaynotificationpage: function (req, res) {
      res.status(200).render("client/notificationsPage", {
        pageTitle: "Notifications",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
      });
    },
    //display notification 
    sendnotification: function (req, res) {
      var searchObj = { userTo: req.session.user._id, notificationType: { $ne: "newMessage" } };

      if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
          searchObj.opened = false;
      }
      
      Notification.find(searchObj)
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 })
      .then(results => res.status(200).send(results))
      .catch(error => {
        console.log(error);
        res.sendStatus(400);
      })
    },
    //readed or notreaded notification
    activeordeactive: async function (req, res) {
      Notification.findByIdAndUpdate(req.params.id, { opened: true })
      .then(() => res.sendStatus(204))
      .catch(error => {
        console.log(error);
        res.sendStatus(400);
      })

    },
    // read all notification button
    doublecheckbtn: function (req, res){
      Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
      .then(() => res.sendStatus(204))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    },
    // notification realtime Badge
    notificationbadge: function (req, res){
      Notification.findOne({ userTo: req.session.user._id })
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 })
      .then(results => res.status(200).send(results))
      .catch(error => {
          console.log(error);
          res.sendStatus(400);
      })
    },
   
  };
}

module.exports = notificationController;
