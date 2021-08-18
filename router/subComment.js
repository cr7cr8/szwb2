const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment, SubComment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");

router.get("/:commentid", function (req, res, next) {


  console.log(req.params.commentid)
  SubComment.find({ commentID: req.params.commentid }).sort({ "postingTime": -1 }).then(docs => {
  // console.log(docs)
    res.json(docs)
  })

 
})




router.post("/", function (req, res, next) {
  SubComment.create({ ...req.body, }).then(doc => {

    // doc._doc.commentNum = 0
    // console.log(doc)
    res.json(doc)
  })

})



router.get("/count/:subcommentid", function (req, res, next) {

  SubComment.countDocuments({ "subCommentID": req.params.subcommentid }).exec(function (err, count) {
    res.json(count)
  })
 
  
})


module.exports = router