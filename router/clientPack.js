const express = require('express')
const router = express.Router()

const path= require("path")



router.use(express.static(path.resolve(__dirname, "../client/build")))
// router.use((req,res)=>{

//      res.sendFile(path.resolve(__dirname,"../client","build","index.html"))


//  })



 module.exports = router;