const User = require("../../models/clientModel/userSchema")
const bcrypt = require("bcrypt")

function authController(){
    return{
//!login routes
        login : function (req, res) {
            res.render('client/login')
        },
//!login user
        postlogin : async function(req,res) {
            var payload = req.body

            if(req.body.logUsername && req.body.logPassword) {
                var user = await User.findOne({ role: 'user',
                    $or: [
                        { username: req.body.logUsername },
                        { email: req.body.logUsername },
                    ]
                })
                .catch((error) => {
                    console.log(error)
                    payload.errorMessage = 'Something went wrong.'
                    res.status(200).render('client/login', payload)
                });
                
                if(user != null) {
                    var result = await bcrypt.compare(req.body.logPassword, user.password)
        
                    if(result === true) {
                        req.session.user = user
                        return res.redirect('/')
                    }
                }
        
                payload.errorMessage = 'Login credentials incorrect.'
                return res.status(200).render('client/login', payload)
            }
        
            payload.errorMessage = 'Make sure each field has a valid value.'
            res.status(200).render('client/login')
        },


//!register routes
        register : function (req, res) {
            res.render('client/register')
        },
//!register user
        postregister: async function(req, res){
            var firstName = req.body.firstName.trim()
            var lastName = req.body.lastName.trim()
            var username = req.body.username.trim()
            var email = req.body.email.trim()
            var password = req.body.password
        
            var payload = req.body

            if(firstName && lastName && username && email && password) {
                var user = await User.findOne({
                    $or: [
                        { username: username },
                        { email: email },
                    ]
                })
                .catch((error) => {
                    console.log(error);
                    payload.errorMessage = 'Something went wrong.'
                    res.status(200).render('client/register', payload)
                });
        
                if(user == null) {
                    // No user found
                    var data = req.body
                    data.password = await bcrypt.hash(password, 10)
        
                    User.create(data)
                    .then((user) => {
                        req.session.user = user
                        return res.redirect('/')
                    })
                }
                else {
                    // User found
                    if (email == user.email) {
                        payload.errorMessage = 'Email already in use.'
                    }
                    else {
                        payload.errorMessage = 'Username already in use.'
                    }
                    res.status(200).render('client/register', payload)
                }
            }
            else {
                payload.errorMessage = 'Make sure each field has a valid value.'
                res.status(200).render('client/register', payload)
            }
        },

//!logut rotes
        logout : function(req,res){
            if(req.session) {
                req.session.destroy(() => {
                    res.redirect('/login')
                })
            }
        }  
    } 
}
module.exports = authController