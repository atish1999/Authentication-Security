import { config } from "dotenv";
//* config()  Loads .env file contents
config();

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import md5 from "md5";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));


mongoose
    .connect("mongodb://localhost:27017/userDB", {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("connections with data base successful");
    })
    .catch((err) => {
        console.log(err);
    });



const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

/*
//*                    ENCRYPTING DATABASE
*/


const User = mongoose.model('User', userSchema);


app.route("/")
    .get((req, res) => {
        res.render('home');
    });



app.route("/register")
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {

        const newUser = new User({
            email: req.body.username,
            password: md5(req.body.password) // just for generating hash
        });

        // res.send(newUser);

        newUser.save((err) => {
            if (err) {
                console.log(err);
            } else {
                res.render('secrets');
            }
        });

    });



app.route("/login")
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {

        User.findOne(

            {
                email: req.body.username,
            },
            (err, foundUser) => {

                if (err) {
                    console.log(err);
                } else {
                    if (foundUser) {
                        if (foundUser.password === md5(req.body.password)) {
                            res.render('secrets');
                        }
                    }
                }
            }
        );

    });


app.get("/logout", (req, res) => {
    res.render("home");
});


app.listen(3000, () => {
    console.log("serever started on port 3000");
});