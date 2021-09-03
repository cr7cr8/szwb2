const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Article, Comment, SubComment } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
const mongoose = require("mongoose");
const Jimp = require('jimp');
const [{ }, { }, { }, { checkConnState, uploadFile, downloadFile, deleteFileByUserName, getFileArray, isFileThere }] = require("../db/fileManager");



const multiavatar = require('@multiavatar/multiavatar')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();



router.post("/",

  authenticateToken, checkConnState, getFileArray, getAvatarImageArray, deleteFileByUserName, uploadFile, function (req, res) { res.json("upload done") })

router.get("/:username", checkConnState,
  function (req, res, next) {
    req.params.username = req.params.username.substring(0, req.params.username.length - 4)
    next()
  },

  isFileThere,
  function (req, res) {

    const svg = multiavatar(req.params.username)
    res.set('Content-Type', 'image/svg+xml');
    res.send(parser.format('avatar.svg', svg).buffer)

  })



function getAvatarImageArray(req, res, next) {

  //res.json(req.files.length)
  console.log(req.files.length)

  req.files.forEach(function (imgFile, index) {
    Jimp.read(imgFile.buffer).then(function (image) {

      const { width, height } = image.bitmap;
      req.files[index].oriantation = width >= height ? "horizontal" : "verticle"

      image.resize(width <= height ? 100 : Jimp.AUTO, height <= width ? 100 : Jimp.AUTO)
        .crop(height > width ? 0 : (width * 100 / height - 100) / 2, 0, 100, 100)
        .quality(60) //image.scale(0.2)//.getBase64Async(Jimp.MIME_JPEG)//.writeAsync("aaa.png")
        .getBufferAsync(image.getMIME())
        .then(function (imgBuffer) {
          req.files[index].buffer = imgBuffer;
          req.files[index].size = imgBuffer.length;
          if (index === req.files.length - 1) { next() }
        }).catch(err => { console.log("error in converting small avatar image ", err) })

    })
  })

}




module.exports = router