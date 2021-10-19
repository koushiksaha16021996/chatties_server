const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors=require("cors");
const bodyparser=require("body-parser");

app.use(bodyparser.urlencoded({
    extended : true
}))
app.use(bodyparser.json())
app.use(cors());

const db = "mongodb+srv://admin:admin@cluster0.vtktc.mongodb.net/storageappdata?retryWrites=true&w=majority"

mongoose.connect(db,
    { useNewUrlParser: true ,
     useUnifiedTopology: true }).then(()=>{
    console.log("CONNECTED")
}).catch((err)=> console.log("NOT CONNECTED"))

const profiledata = new mongoose.Schema({
    "name":"",
    "email":"",
    "tokenid":"",
})
const Profile = mongoose.model("Profile",profiledata)

app.post("/createaccnt", (req,res)=>{
    
    const profile= new Profile({
        name: req.body.name,
        email: req.body.email,
        tokenid:req.body.tokenid,
    })
    profile.save().then(data=>{
        res.send(data)
    })
})
app.post("/login", (req,res)=>{
    Profile.findOne({email: req.body.email}).then(data=>{
        if(data){
            res.send({
                errorMessage:200,
                user : data
            })
        }
        else{
            res.send({errorMessage:201})
        }
    })
})

app.get("/check",(req,res)=>{
    res.send("checking complete")
})



app.listen(4000, ()=>{
    console.log("LISTENING TO PORT 4000")
})