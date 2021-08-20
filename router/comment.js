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



router.get("/loadfive/:postid/:postingTime", function (req, res, next) {
  Comment.find({ "postingTime": { $lt: Number(req.params.postingTime) }, postID: req.params.postid })
    .sort({ "postingTime": -1 })
    .limit(5)
    .populate("commentSubComment")
    .exec()
    .then(docs => {

      if (!docs[0]) { res.json([]) }


      else {
        docs.forEach(doc => {
          doc._doc.subCommentCount = doc.commentSubComment.length
        })

        res.json(docs)
      }
      // console.log({ ...docs[0]._doc, commentCount: docs[0].$$populatedVirtuals.articleComment.length })
    })
})

router.get("/:postid", function (req, res, next) {
  Comment.find({ postID: req.params.postid })
    .sort({ "postingTime": -1 })
    .populate("commentSubComment")
    .exec()
    .then(docs => {
      // console.log(docs)

      if (!docs[0]) { res.json([]) }


      else {

        docs.forEach(doc => {
          doc._doc.subCommentCount = doc.commentSubComment.length
        })

        res.json(docs)
        // console.log(docs)
      }
    })

})








router.get("/deletecomment/:commentid", authenticateToken, function (req, res, next) {
  Comment.deleteOne({ commentID: req.params.commentid }).then(doc => {
    res.json(doc)
  })

})

module.exports = router