exports.requireLogin = (req, res, next) => {
    if(req.session){
        if(req.session.user){
            if(req.session.user.role === "admin"){
                return next();
            }
            else {
                return res.redirect('/adminlogin'); 
            }
        }
        else {
            return res.redirect('/adminlogin');
        }
    }
    else {
        return res.redirect('/adminlogin');
    }
}