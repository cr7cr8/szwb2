const mongoose = require("mongoose")
mongoose.connection.on('error', function (err) {
  // console.log('Mongoose default connection error: ' + err);

 // console.log("aaaaaaaaaaaaaaa")
});

const { connSzwb2DB, connEmojiDB, connPictureDB, connParam } = {

  // EmojiDB: "mongodb+srv://boss:ABCabc123@cluster0-lsf8g.azure.mongodb.net/EmojiDB?retryWrites=true&w=majority",
  // szwb2DB: "mongodb+srv://boss:ABCabc123@cluster0-lsf8g.azure.mongodb.net/szwb2?retryWrites=true&w=majority",
  // pictureDB: "mongodb+srv://boss:ABCabc123@cluster0-lsf8g.azure.mongodb.net/pictureDB?retryWrites=true&w=majority",
  EmojiDB: "mongodb+srv://boss:ABCabc123@cluster1-lsf8g.azure.mongodb.net/EmojiDB?retryWrites=true&w=majority",
  szwb2DB: "mongodb+srv://boss:ABCabc123@cluster1-lsf8g.azure.mongodb.net/szwb2?retryWrites=true&w=majority",
  pictureDB: "mongodb+srv://boss:ABCabc123@cluster1-lsf8g.azure.mongodb.net/pictureDB?retryWrites=true&w=majority",

  connParam: { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false,/*poolSize:10*/ },

  get connSzwb2DB() {
    return mongoose.createConnection(this.szwb2DB, this.connParam)
  },

  get connEmojiDB() {
    return mongoose.createConnection(this.EmojiDB, this.connParam)
  },

  get connPictureDB() {
    return mongoose.createConnection(this.pictureDB, this.connParam)
  },

}





function wrapAndMerge(...args) {

  return args.map(function (fn) {
    return {
      [fn.name]: function (req, res, next) {
        try {
          const obj = fn(req, res, next);
          return (Promise.resolve(obj) === obj)
            ? obj.catch(ex => res.send(`<h1>Async error from function <br> ${fn.name}<br> ${ex}</h1>`))
            : obj
        }
        catch (ex) { res.send(`<h1>something wrong when calling function  <br> ${fn.name}<br></h1> ${ex.stack}`) }
      }
    }
  }).reduce(
    function (accumulator, currentValue) {
      return { ...accumulator, ...currentValue }
    })
}

module.exports = {
  // connDB,
  // connDB2,
  // connDB3,
  // connDB4,
  connSzwb2DB,
  connEmojiDB,
  connPictureDB,
  wrapAndMerge,
}
