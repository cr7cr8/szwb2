const express = require("express");
const router = express.Router();
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth');

const [{ checkConnState, getFileArray, uploadFile, downloadFile, deleteFileById, deleteOldFile, downloadFileByName },

  { checkConnState: checkConnState2, downloadFile: downloadFile2 },
  { checkConnState: checkConnState3, downloadFile: downloadFile3 }

] = require("../db/fileManager");



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

router.get("/downloadbackpicture/:id",
  //function(req,res,next){res.json("aaa")},
  checkConnState2,
  downloadFile2
)

router.get("/downloademoji/:emojiname",

  checkConnState3,

  downloadFile3


)


module.exports = router