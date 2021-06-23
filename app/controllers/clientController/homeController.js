function homeController(){
    return{
        home : function (req, res) {
            var payload = {
                pageTitle: 'home',
                userLoggedIn: req.session.user,
                userLoggedInJs: JSON.stringify(req.session.user),
            }
        
            res.status(200).render('client/home', payload);
        }
    } 
}
module.exports = homeController