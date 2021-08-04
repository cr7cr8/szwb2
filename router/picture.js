const express = require("express");
const router = express.Router();
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth');

const [{ checkConnState, getFileArray, uploadFile, downloadFile, deleteFileById, deleteOldFile,downloadFileByName }] = require("../db/fileManager");



router.get("/", function (req, res, next) {


  res.send("pic")


})

router.post("/uploadpicture",
  checkConnState,
  getFileArray,
  uploadFile,

  function (req, res, next) {

    console.log("got picture")
    res.json("got picture")

  })


router.get("/downloadpicture/:picname",
  checkConnState,
  downloadFile,
)



module.exports = router