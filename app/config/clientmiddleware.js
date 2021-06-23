exports.requireLogin = (req, res, next) => {
    if(req.session){
        if(req.session.user){
            if(req.session.user.role === "user"){
                return next();
            }
            else {
                return res.redirect('/login'); 
            }
        }
        else {
            return res.redirect('/login');
        }
    }
    else {
        return res.redirect('/login');
    }
}