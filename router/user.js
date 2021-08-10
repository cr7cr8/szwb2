const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Article } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth');


router.get("/register", function (req, res, next) {

  console.log(req.headers)

  res.send("fdfdf")
})

router.post("/register", function (req, res, next) {


  //req.body = { userName: "fdfsfdsf" }

  // User.create({ userName: "user" + Math.floor(Math.random() * 1000) }).then(doc => {


  //   req.body = { userName:doc.userName, userId: doc.id }
  //   console.log(req.body)
  //   next()
  // })


  req.body = { userName: "user" + Math.floor(Math.random() * 1000), userId: "u" + Math.floor(Math.random() * 1000000000) }
  console.log(req.body)
  next()





}, generateAndDispatchToken)




module.exports = router


