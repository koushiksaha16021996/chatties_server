const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
console.log(CLEINT_SECRET);
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "indusnet.projectgroup1@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "indusnet.projectgroup1@gmail.com",
      to: email,
      subject: "Reset Password Link",
      text: "Hello from team",
      html: "<h1>Hello from gmail email using API</h1>",
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

var serviceAccount = require("./chatties-c24b8-firebase-adminsdk-mbk9o-013d47ee30.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatties-c24b8.firebaseio.com",
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const db =
  "mongodb+srv://admin:admin@cluster0.vtktc.mongodb.net/storageappdata?retryWrites=true&w=majority";

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("CONNECTED");
  })
  .catch((err) => console.log("NOT CONNECTED"));

const profiledata = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  tokenid: String,
  profileUrl: String,
  isActive: Boolean,
  lastSeen: String,
});
const Profile = mongoose.model("Profile", profiledata);

app.post("/createaccnt", (req, res) => {
  console.log(req.body);
  const profile = new Profile({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    tokenid: req.body.tokenid,
    profileUrl: req.body.profileUrl,
    isActive: req.body.isActive,
    lastSeen: req.body.lastSeen,
  });
  profile.save().then((data) => {
    res.send(data);
  });
});
app.post("/login", (req, res) => {
  Profile.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      Profile.findOneAndUpdate(
        { email: req.body.email },
        {
          isActive: req.body.isActive,
          lastSeen: req.body.lastSeen,
        }
      )
        .then((response) => {
          if (response) {
            Profile.findOne({ email: req.body.email }).then((newdata) => {
              console.log("login data", newdata);
              res.send({
                errorMessage: 200,
                user: newdata,
              });
            });
          }
        })
        .catch((error) => {
          console.log("login error", error);
        });
    } else {
      res.send({ errorMessage: 201 });
    }
  });
});

app.post("/logout", (req, res) => {
  Profile.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      Profile.findOneAndUpdate(
        { email: req.body.email },
        {
          isActive: req.body.isActive,
          lastSeen: req.body.lastSeen,
        }
      )
        .then((response) => {
          if (response) {
            Profile.findOne({ email: req.body.email }).then((newdata) => {
              console.log("login data", newdata);
              res.send({
                errorMessage: 200,
                user: newdata,
              });
            });
          }
        })
        .catch((error) => {
          console.log("logout error", error);
        });
    } else {
      res.send({ errorMessage: 202 });
    }
  });
});

app.post("/loginWhenForeground", (req, res) => {
  Profile.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      Profile.findOneAndUpdate(
        { email: data.email },
        {
          isActive: req.body.isActive,
          lastSeen: req.body.lastSeen,
        }
      )
        .then((response) => {
          if (response) {
            Profile.findOne({ email: data.email }).then((newdata) => {
              console.log("login data", newdata);
              res.send({
                errorMessage: 200,
                user: newdata,
              });
            });
          }
        })
        .catch((error) => {
          console.log("login error", error);
        });
    } else {
      res.send({ errorMessage: 204 });
    }
  });
});

app.post("/logoutWhenBackground", (req, res) => {
  Profile.findOne({ email: req.body.email }).then((data) => {
    if (data) {
      Profile.findOneAndUpdate(
        { email: data.email },
        {
          isActive: req.body.isActive,
          lastSeen: req.body.lastSeen,
        }
      )
        .then((response) => {
          if (response) {
            Profile.findOne({ email: data.email }).then((newdata) => {
              console.log("logout data", newdata);
              res.send({
                errorMessage: 200,
                user: newdata,
              });
            });
          }
        })
        .catch((error) => {
          console.log("logout error", error);
        });
    } else {
      res.send({ errorMessage: 204 });
    }
  });
});
app.post("/allcheck", (req, res) => {
  console.log(req);
  res.send({ errorMessage: false });
});

app.post("/resetpassword", (req, res) => {
  admin
    .auth()
    .generatePasswordResetLink(req.body.email)
    .then((ress) => {
      // res.send(ress)
      console.log(ress);
      sendMail(req.body.email)
        .then((Res) => {
          res.send({
            errorCode: 500,
            resetUrl:ress,
          });
        })
        .catch((error) => {
          res.send({
            errorCode: 501,
            resetUrl:ress,
          });
        });
    })
    .catch((error) => {
      res.send({
        errorCode: 502,
      });
    });
});

app.get("/check", (req, res) => {
  res.send("checking complete");
  var message = {
    notification: {
      title: "Chatties",
      body: "Chat with your love",
      image:
        "https://firebasestorage.googleapis.com/v0/b/chatties-c24b8.appspot.com/o/FCMImages%2Favater.jpg?alt=media&token=f51a8d05-4099-43fc-a5a1-36e1311a938a",
    },
    data: {
      msgType: "Search",
      word: "Love",
    },
    android: {
      notification: {
        sound: "default",
        visibility: "public",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
    token:
      "fHMqfha2SveNTswMpjp6Sq:APA91bGtAOJaHRHNTIo5N8PJZXYp0T8AcoP9snD4FhNz55-k9sq3V4qqgABuwmxuZqDRNfw-I31d7h1WUPvtwejzTuNoLP0ZVGLKzdQ9eg1bM1LzSKiqcc7g8XC-3dEeqMAZh8rpRwVG",
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message: ", response);
    })
    .catch((error) => {
      console.log("Error sending message: ", error);
    });
});

app.listen(4000, () => {
  console.log("LISTENING TO PORT 4000");
});
