const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment, SubComment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");

const { connSzwb2DB } = require("../db/db")

const [{ checkConnState, deleteFileByPostID }] = require("../db/fileManager");


// connSzwb2DB.db.collection("avatar.files").updateMany({ "metadata.ownerName": "LocalChrome" }, { $set: { "metadata.ownerName": "aaa" } })
// .then(result=>{   console.log(result)})

// setTimeout(() => {
//   // connSzwb2DB.db.collection("avatar.files").find({ "metadata.ownerName": "LocalChrome"}).toArray(function (err, docs) {
//   //   console.log(docs)
//   // })

//   connSzwb2DB.db.collection("avatar.files").updateMany({ "metadata.ownerName": "LocalChrome" }, { $set: { "metadata.ownerName": "aaa" } })
//     .then(result => { console.log(result) })


// }, 3000);



router.get("/",/*authenticateToken*/function (req, res, next) {

  Article.find({}).sort({ "postingTime": -1 }).then(docs => {
    //   console.log(docs)
    //    console.log(Array.isArray(docs))
    res.json(docs)
  })


})


router.get("/count", function (req, res, next) {

  Article.countDocuments({}).exec(function (err, count) {
    res.json(count)
  })
})


router.post("/changeownername", authenticateToken,

  function (req, res, next) {
    connSzwb2DB.db.collection("avatar.files").find({ "metadata.ownerName": req.body.newName }).toArray(function (err, docs) {
      if (docs.length === 0) { next() }
      else { res.json(false) }
    })
  },

  function (req, res, next) {
    Article.find({ "ownerName": req.body.newName }).then(docs => {
      if (docs.length === 0) { next() }
      else { res.json(false) }
    })
  },

  function (req, res, next) {
    Comment.find({ "ownerName": req.body.newName }).then(docs => {
      if (docs.length === 0) { next() }
      else { res.json(false) }
    })
  },


  function (req, res, next) {
    SubComment.find({ "ownerName": req.body.newName }).then(docs => {
      if (docs.length === 0) { next() }
      else { res.json(false) }
    })
  },

  function (req, res, next) {

    connSzwb2DB.db.collection("avatar.files").updateMany({ "metadata.ownerName": req.user.userName }, { $set: { "metadata.ownerName": req.body.newName } })
      .then(result => {

    //   console.log(result)

        next()
      })


  },

  function (req, res, next) {
    Comment.updateMany({ "ownerName": req.user.userName }, { $set: { "ownerName": req.body.newName } }, { new: true }).then(docs => {
      next()
    })
  },

  function (req, res, next) {
    SubComment.updateMany({ "ownerName": req.user.userName }, { $set: { "ownerName": req.body.newName } }, { new: true }).then(docs => {
      next()
    })
  },




  function (req, res, next) {
    Article.updateMany({ "ownerName": req.user.userName }, { $set: { "ownerName": req.body.newName } }, { new: true }).then(docs => {
      const token = jwt.sign({ ...req.user, userName: req.body.newName }, 'secretKey')
      res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .json({ ...req.user, userName: req.body.newName })
    })
  }

)


router.get("/singlepost2/:postingTime",

  function (req, res, next) {
    Article.find({ "postingTime": { $lt: Number(req.params.postingTime) } })
      .sort({ "postingTime": -1 })
      .limit(1)
      .populate("articleComment")
      .exec()
      .then(docs => {

        if (!docs[0]) { res.json([]) }
        //   const obj=docs[0]
        //   console.log(...obj)
        //    docs[0].commentCount = docs[0].articleComment.length

        //   console.log(docs[0].commentCount, docs[0],docs)
        //  res.json(docs)
        //     docs[0]._doc.commentCount = docs[0]._doc.articleComment

        // console.log(Object.keys(docs[0].$$populatedVirtuals))
        //console.log(docs[0].$$populatedVirtuals)

        //      console.log(...docs[0])

        else {
          res.json([{ ...docs[0]._doc, commentCount: docs[0].$$populatedVirtuals.articleComment.length }])
        }
        // console.log({ ...docs[0]._doc, commentCount: docs[0].$$populatedVirtuals.articleComment.length })
      })
  })


router.get("/singlepost/:num",
  /*authenticateToken,*/
  function (req, res, next) {


    Article.countDocuments({}).exec(function (err, count) {


      if (Number(req.params.num) >= count) {
        return res.json([])
      }
      else {

        Article.find({}).sort({ "postingTime": -1 }).limit(Number(req.params.num) + 1).then(docs => {
          //  console.log(docs.length)
          res.json([docs.pop()])
        })
      }
    })
  })

router.get("/deletesinglepost/:postid", authenticateToken, function (req, res, next) {


  Comment.deleteMany({ postID: req.params.postid }).then(docs => {
    // console.log(docs)
  })

  SubComment.deleteMany({ postID: req.params.postid }).then(docs => {
    // console.log(docs)
  })

  Article.deleteOne({ postID: req.params.postid }).then(doc => {
    if ([...req.params.postid].pop() !== "0") {
      next()
    }
    else {
      res.json(`delete Article postID ${req.params.postid} done`)
    }
    //res.json(doc)
  })



}, checkConnState, deleteFileByPostID, function (req, res) { res.json(`delete picture ${req.params.postid} done`) })



router.post("/", function (req, res, next) {

  // console.log(Date.now())
  Article.create({ ...req.body, }).then(doc => {

    doc._doc.commentNum = 0
    // console.log(doc)
    res.json(doc)
  })

})




module.exports = router