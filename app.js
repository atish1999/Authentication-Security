import { config } from "dotenv";
//* config()  Loads .env file contents
config();

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from 'passport-local-mongoose';

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));

//* Initializing a session by using express-session with some configuration
app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: true,
}))

//* Initializing passport
app.use(passport.initialize());
//* setting up sessions with passport
app.use(passport.session());

mongoose
    .connect("mongodb://localhost:27017/userDB", {
        useNewUrlParser: true,
        //* For getting rid from the deprecation warning as we are using 3rd party packages
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("connections with data base successful");
    })
    .catch((err) => {
        console.log(err);
    });


const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

//* Adding Plugins into database Schema i.e. setting up passportLocalMongoose
userSchema.plugin(passportLocalMongoose);


const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
//* Serialize is for creating a login cookies for a specific user
passport.serializeUser(User.serializeUser());
//* Deserialize is for destroying a login cookies and finding out the user credentials
passport.deserializeUser(User.deserializeUser());


app.route("/")
    .get((req, res) => {
        res.render('home');
    });

app.get("/secrets", (req, res) => {
    //* isAuthenticated() basically tells that the user is logged in the current session
    //* means he can enter otherwise login again 
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.route("/register")
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {

        //* This register method is present in passport-local-mongoose package 
        User.register(
            { username: req.body.username }, req.body.password,
            (err, user) => {

                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {

                    passport.authenticate("local")(req, res, () => {
                        res.redirect("/secrets");
                    });
                }
            }
        );

    });



app.route("/login")
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        //* This login method is present in passport-local-mongoose package 
        req.login(user, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/login');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
            }
        });

    });


app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


app.listen(3000, () => {
    console.log("serever started on port 3000");
});
