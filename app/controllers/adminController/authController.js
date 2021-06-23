const User = require("../../models/clientModel/userSchema")
const bcrypt = require("bcrypt")

function authController(){
    return{
//!login routes
        login : function (req, res) {
            res.render('admin/adminlogin')
        },
//!login user
        postlogin : async function(req,res) {
            var payload = req.body

            if(req.body.logUsername && req.body.logPassword ) {
                var user = await User.findOne({ role: 'admin',
                    $or: [
                        { username: req.body.logUsername },
                        { email: req.body.logUsername },
                    ]
                })  
                .catch((error) => {
                    console.log(error)
                    payload.errorMessage = 'Something went wrong.'
                    res.status(200).render('admin/adminlogin', payload)
                });
                
                if(user != null) {
                    var result = await bcrypt.compare(req.body.logPassword, user.password)
        
                    if(result === true) {
                        req.session.user = user
                        return res.redirect('/dashboard')
                    }
                }
        
                payload.errorMessage = 'Login credentials incorrect.'
                return res.status(200).render('admin/adminlogin', payload)
            }
        
            payload.errorMessage = 'Make sure each field has a valid value.'
            res.status(200).render('admin/adminlogin')
        },

//!logut rotes
        logout : function(req,res){
            if(req.session) {
                req.session.destroy(() => {
                    res.redirect('/adminlogin')
                })
            }
        }  
    } 
}
module.exports = authController