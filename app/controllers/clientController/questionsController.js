const User = require("../../models/clientModel/userSchema");
const Post = require("../../models/clientModel/postSchema");
const Notification = require("../../models/clientModel/notificationSchema");

function postController() {
  return {
    //! Display question(post) at home page and profile page
    displayquestions: async function (req, res) {
      var searchObj = req.query;
      if (searchObj.isReply !== undefined) {
        var isReply = searchObj.isReply == "true";
        searchObj.answerTo = { $exists: isReply };
        delete searchObj.isReply;
      }
      //search post using regex
      if (searchObj.search !== undefined) {
        searchObj.content = { $regex: searchObj.search, $options: "i" };
        delete searchObj.search;
      }

      //only followed users question shown
      if (searchObj.followingOnly !== undefined) {
        var followingOnly = searchObj.followingOnly == "true";

        if (followingOnly) {
          var objectIds = [];

          if (!req.session.user.following) {
            req.session.user.following = [];
          }

          req.session.user.following.forEach((user) => {
            objectIds.push(user);
          });

          objectIds.push(req.session.user._id);
          searchObj.postedBy = { $in: objectIds };
        }

        delete searchObj.followingOnly;
      }
      var results = await getPosts(searchObj);
      res.status(200).send(results);
    },
    // display question in model
    displayquestionmodel: async function (req, res) {
      var postId = req.params.id;
      var postData = await getPosts({ _id: postId });
      postData = postData[0];
      var results = {
        postData: postData,
      };
      if (postData.answerTo !== undefined) {
        results.answerTo = postData.answerTo;
      }
      results.replies = await getPosts({ answerTo: postId });
      res.status(200).send(results);
    },

    //! Post New question at home page
    postquestions: function (req, res) {
      if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
      }

      var postData = {
        content: req.body.content,
        postedBy: req.session.user,
      };
      //reply(answer) of post
      if (req.body.answerTo) {
        postData.answerTo = req.body.answerTo;
      }

      Post.create(postData)
        .then(async (newPost) => {
          newPost = await User.populate(newPost, { path: "postedBy" });
          newPost = await Post.populate(newPost, { path: "answerTo" });

          // answer notification
          if (newPost.answerTo !== undefined) {
            await Notification.insertNotification(
              newPost.answerTo.postedBy,
              req.session.user._id, 
              "answered", 
              newPost._id
            );
          }

          res.status(201).send(newPost);
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
    },
    //! Like the question(post)
    postLikes: async function (req, res) {
      var postId = req.params.id;
      var userId = req.session.user._id;
      var isliked = req.session.user.likes && req.session.user.likes.includes(postId);

      var option = isliked ? "$pull" : "$addToSet";
      
      // Insert user like
      req.session.user = await User.findByIdAndUpdate( 
        userId, 
        { [option]: { likes: postId } }, 
        { new: true })
        .catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // Insert post like
      var post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { likes: userId } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // liked user notification
      if (!isliked) {
        await Notification.insertNotification(
          post.postedBy,
          userId,
          "postLike",
          post._id
        );
      }

      res.status(200).send(post);
    },
    
    //! DisLike the question(post)
    postdisLikes: async function (req, res) {
      var postId = req.params.id;
      var userId = req.session.user._id;

      var disliked = req.session.user.dislikes && req.session.user.dislikes.includes(postId);

      var option = disliked ? "$pull" : "$addToSet";

      // Insert user dislike
      req.session.user = await User.findByIdAndUpdate(
        userId,
        { [option]: { dislikes: postId } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // Insert post dislike
      var post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { dislikes: userId } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // liked user notification
      if (!disliked) {
        await Notification.insertNotification(
          post.postedBy,
          userId,
          "postdisLike",
          post._id
        );
      }

      res.status(200).send(post);
    },

    //! Reasked question(post)
    postreasked: async function (req, res) {
      var postId = req.params.id;
      var userId = req.session.user._id;

      // Try and delete (unasked) question
      var deletedPost = await Post.findOneAndDelete({
        postedBy: userId,
        retweetData: postId,
      }).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      var option = deletedPost != null ? "$pull" : "$addToSet";

      var repost = deletedPost;

      if (repost == null) {
        repost = await Post.create({
          postedBy: userId,
          retweetData: postId,
        }).catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
      }
      // Insert user reasked
      req.session.user = await User.findByIdAndUpdate(
        userId,
        { [option]: { retweets: repost._id } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // Insert post reasked
      var post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { retweetUsers: userId } },
        { new: true }
      ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
      });

      // reasked user notification
      if (!deletedPost) {
        await Notification.insertNotification(
          post.postedBy,
          userId,
          "reasked",
          post._id
        );
      }

      res.status(200).send(post);
    },

    //! Delete question(post)
    deletepost: function (req, res) {
      Post.findByIdAndDelete(req.params.id)
        .then(() => res.sendStatus(202))
        .catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
    },

    //! Pin and Unpin Post
    pinPost: async function (req, res) {
      if (req.body.pinned !== undefined) {
        await Post.updateMany(
          { postedBy: req.session.user },
          { pinned: false }
        ).catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
      }
      Post.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
        .catch((error) => {
          console.log(error);
          res.sendStatus(400);
        });
    },
  };
}

//! Filter Question on Display function (globle function)
async function getPosts(filter) {
  var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("answerTo")
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));

  results = await User.populate(results, { path: "answerTo.postedBy" });
  return await User.populate(results, { path: "retweetData.postedBy" });
}

module.exports = postController;
