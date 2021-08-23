const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment, SubComment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");

router.get("/:commentid", function (req, res, next) {


 // console.log(req.params.commentid)
  SubComment.find({ commentID: req.params.commentid }).sort({ "postingTime": -1 }).then(docs => {
  // console.log(docs)
    res.json(docs)
  })

 
})




router.get("/loadfive2/:commentID/:postingTime", function (req, res, next) {
  SubComment.find({ "postingTime": { $lt: Number(req.params.postingTime) }, commentID: req.params.commentID })
    .sort({ "postingTime": -1 })
    .limit(5)
    .exec()
    .then(docs => {
      if (!docs[0]) { res.json([]) }
      else {
        // docs.forEach(doc => {
        //   doc._doc.subCommentCount = doc.commentSubComment.length
        // })
        res.json(docs)
      }
      // console.log({ ...docs[0]._doc, commentCount: docs[0].$$populatedVirtuals.articleComment.length })
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

router.get("/deletesubcomment/:subcommentid", function(req,res,next){


  SubComment.deleteOne({subCommentID:req.params.subcommentid}).then(doc=>{
    res.json(doc)
  })

})



module.exports = router