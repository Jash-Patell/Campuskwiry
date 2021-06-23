function settingController(){
    return{
        index : function (req, res) {
            var payload = {
                pageTitle: "User Controller",
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
                profileUser: req.session.user
            }
            res.status(200).render('admin/setting', payload) 
        }
    } 
}
module.exports = settingController