const multer = require("multer");
const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");
const { connSzwb2DB, connEmojiDB, connPictureDB } = require("./db")
const Jimp = require('jimp');





function createFileManager(connDB, collectionName) {

    return {

        checkConnState: function (req, res, next) { checkConnState(connDB, collectionName, req, res, next) },
        getFileArray: multer({ storage: multer.memoryStorage() }).array("file", 789 /*789 is max count,default infinity*/),

        uploadFile: function (req, res, next) { uploadFile(connDB, collectionName, req, res, next) },
        downloadFile: function (req, res, next) { downloadFile(connDB, collectionName, req, res, next) },
        deleteFileByUserName: function (req, res, next) { deleteFileByUserName(connDB, collectionName, req, res, next) },
        isFileThere: function (req, res, next) { return isFileThere(connDB, collectionName, req, res, next) },


        downloadFileByName: function (req, res, next) { downloadFileByName(connDB, collectionName, req, res, next) },
        deleteFileByPostID: function (req, res, next) { deleteFileByPostID(connDB, collectionName, req, res, next) },
        connDB,
        collectionName,

    }
}

function checkConnState(connDB, collectionName, req, res, next) {


    let arr = ["   ", "   ", ".  ", ".  ", ".. ", ".. ", "...", "...",];
    let index = 0;
    function checking() {

        connDB.readyState === 1
            ? (function () {
                //    process.stdout.write(`Connecting ${collectionName}_Collection ...Connected!` + "\n");
                next()
            }())
            : (function () {
                process.stdout.write(`Connecting ${collectionName}_Collection ${arr[(index++) % arr.length]}` + "\r");
                setTimeout(checking, 123)
            }())
    }
    checking()


}

function uploadFile(connDB, collectionName, req, res, next) {


    req.body.obj = typeof (req.body.obj) === "string" ? JSON.parse(req.body.obj) : req.body.obj

    req.files.forEach(function (file, index) {


        const gfs = new mongoose.mongo.GridFSBucket(connDB.db, {
            chunkSizeBytes: 255 * 1024,
            bucketName: collectionName,
            filename: file.originalname,

        });

        const { fieldname, originalname, encoding, mimetype, buffer, size, oriantation, mongooseID } = file;
        const gfsws = gfs.openUploadStream(file.originalname, {
            chunkSizeBytes: 255 * 1024,



            metadata: {
                ...req.body.obj, fieldname, originalname, encoding, mimetype, size, oriantation,

                mongooseID: String(mongooseID),
                picName: req.body.obj.picName[index]
            },
            contentType: file.mimetype,
        })

        gfsws.write(file.buffer, function (err) { if (err) { console.log("error in uploading file ", err) } });
        gfsws.end(function () {

            req.files[index].mongooseID = gfsws.id


            if (index === req.files.length - 1) {
                console.log("==== All files uploading is done ===");



                next()
                //  res.json("upload done")
            }



        });

    })



}

function downloadFile(connDB, collectionName, req, res, next) {

    console.log(mongoose.Types.ObjectId(req.params.id))
    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {   //connDB3.db
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
        //  bucketName: "avatar",
    });

    let querryObj = req.params.picname
        ? { 'metadata.picName': req.params.picname }
        : { "_id": mongoose.Types.ObjectId(req.params.id) }

    if (req.params.emojiname) {
        querryObj = { 'filename': req.params.emojiname }
    }

    const cursor = gfs.find({ ...querryObj }, { limit: 1 })
    // const cursor = gfs.find({ 'metadata.ownerName': req.params.username, /* "metadata.owner": req.user.username */ }, { limit: 1 })
    //const cursor = gfs.find({ /*'metadata.ownerName': req.params.username,  "metadata.owner": req.user.username */ }, { limit: 1000 })


    cursor.toArray().then(function (fileArr) {
        if (fileArr.length === 0) { res.json("No files found to download") }

        fileArr.forEach(function (doc, index) {

            //   console.log(doc.metadata.oriantation)

            let gfsrs = gfs.openDownloadStream(doc._id);

            res.header('content-type', doc.contentType);
            res.header("access-control-expose-headers", "content-type")

            res.header("file-name", encodeURIComponent(doc.filename))
            res.header("access-control-expose-headers", "file-name")


            doc.metadata.oriantation && res.header("file-oriantation", doc.metadata.oriantation)
            doc.metadata.oriantation && res.header("access-control-expose-headers", "file-oriantation")


            res.header("content-length", doc.length)
            res.header("access-control-expose-headers", "content-length") // this line can be omitted

            gfsrs.on("data", function (data) {
                res.write(data);
            })

            gfsrs.on("close", function () {
                console.log(`------downloading  ${doc.filename} Done !----`);

                if (fileArr.length - 1 === index) {
                    res.end("", function () {
                        console.log(" === All files downloading is done ===")
                    });
                }
            })
        })


    })
}

function downloadFileByName(connDB, collectionName, req, res, next) {
    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {   //connDB3.db
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
        //  bucketName: "avatar",
    });

    const querryObj = req.params.picname

}




function isFileThere(connDB, collectionName, req, res, next) {


    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
    });

    const querryObj = req.params.username
        ? { 'metadata.ownerName': req.params.username }
        : { "_id": mongoose.Types.ObjectId(req.params.id) }

    const cursor = gfs.find({ ...querryObj }, { limit: 1 })






    cursor.toArray().then(function (fileArr) {
        if (fileArr.length === 0) { next() }

        fileArr.forEach(function (doc, index) {

            //   console.log(doc.metadata.oriantation)

            let gfsrs = gfs.openDownloadStream(doc._id);

            res.header('content-type', doc.contentType);
            res.header("access-control-expose-headers", "content-type")

            res.header("file-name", encodeURIComponent(doc.filename))
            res.header("access-control-expose-headers", "file-name")


            doc.metadata.oriantation && res.header("file-oriantation", doc.metadata.oriantation)
            doc.metadata.oriantation && res.header("access-control-expose-headers", "file-oriantation")


            res.header("content-length", doc.length)
            res.header("access-control-expose-headers", "content-length") // this line can be omitted

            gfsrs.on("data", function (data) {
                res.write(data);
            })

            gfsrs.on("close", function () {
                console.log(`------downloading  ${doc.filename} Done !----`);

                if (fileArr.length - 1 === index) {
                    res.end("", function () {
                        console.log(" === All files downloading is done ===")
                    });
                }
            })
        })


    })




    //  return cursor.hasNext()



}


function deleteFileByUserName(connDB, collectionName, req, res, next) {

    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
    });
    const cursor = gfs.find({ 'metadata.ownerName': req.user.userName, /* "metadata.owner": req.user.username */ }, { limit: 1000 })

    cursor.toArray().then(function (fileArr) {
        if (fileArr.length === 0) { next() }
        fileArr.forEach(function (doc, index) {
            gfs.delete(mongoose.Types.ObjectId(doc._id), function (err) {
                err
                    ? console.log(err)
                    : console.log("file " + doc.filename + " " + doc.metadata.ownerName + " deleted");
                if (fileArr.length - 1 === index) {
                    next()
                }

            })

        })

    })

}


function deleteFileById(connDB, collectionName, req, res, next) {

    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
    });
    const cursor = gfs.find({ '_id': mongoose.Types.ObjectId(req.params.id), /* "metadata.owner": req.user.username */ }, { limit: 1 })

    cursor.forEach(function (doc) {
        gfs.delete(mongoose.Types.ObjectId(doc._id), function (err) {
            err
                ? (function () { console.log(err), res.status(500).send("deleting file error", err) }())
                : console.log("file " + doc.filename + " " + doc._id + " deleted");
        })
    }).then(function () {
        console.log("all requested files deleted")
        next()
    })




}

function deleteFileByPostID(connDB, collectionName, req, res, next) {

    const regex = new RegExp(`^${req.params.postid}_[\s\S]*`);
    var gfs = new mongoose.mongo.GridFSBucket(connDB.db, {
        chunkSizeBytes: 255 * 1024,
        bucketName: collectionName,
    });
    const cursor = gfs.find({ 'metadata.picName': { $regex: regex }, }, { limit: 321 })


    cursor.toArray().then(function (fileArr) {
        if (fileArr.length === 0) { next() }
        fileArr.forEach(function (doc, index) {
            gfs.delete(mongoose.Types.ObjectId(doc._id), function (err) {
                err
                    ? console.log(err)
                    : console.log("file " + doc.filename + " " + doc.metadata.ownerName + " deleted");
                if (fileArr.length - 1 === index) {
                    next()
                }

            })

        })

    })


}



module.exports = [

    {
        ...createFileManager(connSzwb2DB, "picture"),
        uploadFile_: uploadFile,
        downloadFile_: downloadFile,
        deleteFileById_: deleteFileById,

    },
    {
        ...createFileManager(connPictureDB, "pic_uploads"),
        uploadFile_: uploadFile,
        downloadFile_: downloadFile,
        deleteFileById_: deleteFileById,

    },
    {
        ...createFileManager(connEmojiDB, "emoji"),

    }

]




///////////////////////////



