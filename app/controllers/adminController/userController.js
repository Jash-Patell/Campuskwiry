const User = require("../../models/clientModel/userSchema");
const Post = require("../../models/clientModel/postSchema");

function userController(){
    return{
        index : function (req, res) {
            var payload = {
                pageTitle: "User Managment",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                profileUser: req.session.user
            }
            res.status(200).render('admin/userManagment', payload) 
        },
        userdetail : async (req, res) => {
            try {
              const users = await User.find({role: 'user'})
            
              const posts = await Post.find();
              const total_posts = posts.length;
  
              let total_likes = 0;
              await posts.map((post) => (total_likes += post.likes.length));
  
              let total_Reasked = 0;
              await posts.map((post) => (total_Reasked += post.retweetUsers.length));

              res.json({ users , total_posts , total_likes , total_Reasked });
  
              } catch (err) {
                  return res.status(500).json({ msg: err.message });
              }
          }
    } 
}
module.exports = userController