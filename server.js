const express = require("express")
const app = express();


const avatar = require("./router/avatar")
const subComment = require("./router/subComment")
const comment = require("./router/comment")
const article = require("./router/article")
const picture = require("./router/picture")
const clientPack = require("./router/clientPack")
const user = require("./router/user")


const multiavatar = require('@multiavatar/multiavatar')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (!process.env.port) {
    const cors = require("cors");
    app.use(cors());
}



app.use("/api/avatar",avatar)
app.use("/api/subcomment", subComment)
app.use("/api/comment", comment)
app.use("/api/article", article)
app.use("/api/picture", picture)
app.use("/api/user", user)

app.get("*", clientPack)


// app.get("/",function(req,res,next){

//   res.send("aaaa")

// })


app.listen(process.env.PORT || 80)


//console.log(process.env)