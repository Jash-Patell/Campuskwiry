const User = require("../../models/clientModel/userSchema");
const Post = require("../../models/clientModel/postSchema");

function spamController(){
    return{
        index: function (req, res){
            var payload = {
                pageTitle: "Spam Controller",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                profileUser: req.session.user
            }
            res.status(200).render('admin/spam', payload) 
        },

        getSpamPosts: async function (req, res){
            try {
                const posts = await Post.find()
                .populate("postedBy")
                const spamPosts = posts.filter((post) => post.dislikes.length > 1);
                res.json({ spamPosts });
              } catch (err) {
                return res.status(500).json({ msg: err.message });
              }
        },
        
        deleteSpamPost: async (req, res) => {
            Post.findByIdAndDelete(req.params.id)
            .then(() => res.sendStatus(202))
            .catch((error) => {
            console.log(error);
            res.sendStatus(400);
            });
        }
    } 
}

module.exports = spamController