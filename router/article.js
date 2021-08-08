const express = require("express");
const router = express.Router();
const { User, Article } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");



router.get("/",/*authenticateToken*/function (req, res, next) {

  Article.find({}).sort({ "postingTime": -1 }).then(docs => {
    //   console.log(docs)
    //    console.log(Array.isArray(docs))
    res.json(docs)
  })


})


router.get("/count",function(req,res,next){

  Article.countDocuments({}).exec(function (err, count) {
    res.json(count)
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
          console.log(docs.length)
          res.json([docs.pop()])
        })
      }


    })




  })



router.post("/", function (req, res, next) {

  // console.log(Date.now())
  Article.create({ ...req.body, }).then(doc => {

    doc._doc.commentNum = 0
    // console.log(doc)
    res.json(doc)
  })

})




module.exports = router