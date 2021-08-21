const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment, SubComment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");

const [{ checkConnState, deleteFileByPostID }] = require("../db/fileManager");



const multiavatar = require('@multiavatar/multiavatar')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();


router.get("/:name", function (req, res) {


  res.set('Content-Type', 'image/svg+xml');

   const svg = multiavatar(req.params.name.replace(".svg",""))


   
  // console.log(parser.format('.svg', svg))
//console.log(svg)
//res.send("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='200' y2='200' style='stroke:rgb(255,0,0);stroke-width:2'/></svg>")

  //console.log(parser.format('.svg', svg).buffer)
   res.send(parser.format('avatar.svg', svg).buffer)

})



// router.get("/aaa.svg", function (req, res) {


//   res.set('Content-Type', 'image/svg+xml');

//    const svg = multiavatar(Date.now())


   
//   // console.log(parser.format('.svg', svg))
// //console.log(svg)
// //res.send("data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='200' y2='200' style='stroke:rgb(255,0,0);stroke-width:2'/></svg>")

//  // console.log(parser.format('.svg', svg).content)
//    res.send(parser.format('aa.svg', svg).buffer)

// })




module.exports = router