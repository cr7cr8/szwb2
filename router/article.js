const express = require("express");
const router = express.Router();
const { User, Article } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");



router.get("/",/*authenticateToken*/function(req,res,next){

  Article.find({}).then(docs=>{
 //   console.log(docs)
//    console.log(Array.isArray(docs))
    res.send(docs)
  })


})






router.post("/",function(req,res,next){

 // console.log(Date.now())
  Article.create({ ...req.body, }).then(doc => {

    doc._doc.commentNum = 0
    // console.log(doc)
    res.json(doc)
})






})




module.exports = router