function answersController(){
    return{
        displayanswers : function (req, res) {
            var payload = {
                pageTitle: "All Answers",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                postId: req.params.id
            }
            
            res.status(200).render("client/answersPage", payload);
        }
    } 
}
module.exports = answersController