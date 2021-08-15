const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");





router.post("/", function (req, res, next) {
  Comment.create({ ...req.body, }).then(doc => {

   // doc._doc.commentNum = 0
    // console.log(doc)
    res.json(doc)
  })

})

router.get("/count/:postid", function (req, res, next) {

  Comment.countDocuments({ "postID": req.params.postid }).exec(function (err, count) {
    res.json(count)
  })

})

router.get("/:postid",function(req,res,next){
  Comment.find({postID:req.params.postid}).sort({"postingTime":-1}).then(docs=>{
    console.log(docs)
    res.json(docs)
  })

})


module.exports = router