function modertorController(){
    return{
        index : function (req, res) {
            var payload = {
                pageTitle: "Modertor Managment",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                profileUser: req.session.user
            }
            res.status(200).render('admin/moderator', payload) 
        }
    } 
}
module.exports = modertorController