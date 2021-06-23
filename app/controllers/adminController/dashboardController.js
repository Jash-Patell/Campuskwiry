const User = require("../../models/clientModel/userSchema");
const Post = require("../../models/clientModel/postSchema");

function dashboardController(){
    return{
        index : async (req, res) => {
            var payload = {
                pageTitle: "dashboard",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                profileUser: req.session.user
            }
            res.status(200).render('admin/dashboard', payload)    
        },
        dashboard : async (req, res) => {
          try {
            const users = await User.find({role: 'user'})
            const total_users = users.length

            const posts = await Post.find();
            const total_posts = posts.length;

            let total_likes = 0;
            await posts.map((post) => (total_likes += post.likes.length));

            let total_Reasked = 0;
            await posts.map((post) => (total_Reasked += post.retweetUsers.length));

            let total_Disliked = 0;
            await posts.map((post) => (total_Disliked += post.dislikes.length));

            res.json({ total_users , total_posts , total_likes , total_Reasked , total_Disliked });

            } catch (err) {
                return res.status(500).json({ msg: err.message });
            }
        }
    } 
}
module.exports = dashboardController