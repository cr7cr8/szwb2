const mongoose = require("mongoose");
const { connSzwb2DB, connEmojiDB, } = require("./db")



const userSchema = new mongoose.Schema({
  themeId: { type: mongoose.Types.ObjectId },
  userName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    index: { unique: true },
    //     validate: [(val) => { return /\d{3}-\d{3}-\d{4}/.test(val) }, "please enter a valid userName"],

  },

  // password: {
  //     type: String,
  //     required: true,
  //     minlength: 3,
  //     maxlength: 1024
  // },
  // friendsList: [{ type: String }],
},
  {
    toObject: { virtuals: true },
    collection: "users",
    timestamps: true,
  }

)


const articleSchema = new mongoose.Schema({

  ownerName: { type: String },
  content: { type: String },
  postID: { type: String },
  postingTime: { type: Number, default: Date.now },


}, {
  toObject: { virtuals: true },
  collection: "articles",
  //  timestamps: true, 
})


userSchema.virtual("userArticle", {
  localField: "userName",   //function(user){  console.log("***",user.friendsList[0]);  return user.friendsList[0] },
  //  localField:  function(user){  console.log("***",user.friendsList[0]);  return user.friendsList[1] },
  foreignField: "ownerName",
  //  foreignField:function(poster){ console.log("***",poster); return "bbb" },
  ref: "articles",
  justOne: false
})



const commentSchema = new mongoose.Schema({

  ownerName: { type: String },
  postID: { type: String },//{ type: mongoose.Types.ObjectId, required: true },
  content: { type: String },
  postingTime: { type: Number, default: Date.now },
}, {
  toObject: { virtuals: true },
  collection: "comments",
})

articleSchema.virtual("articleComment", {
  localField: "postID",
  foreignField: "postID",
  ref: "comments",
  justOne: false,

})


const User = connSzwb2DB.model("users", userSchema);
const Article = connSzwb2DB.model("articles", articleSchema);
const Comment = connSzwb2DB.model("comments", commentSchema);

module.exports = { User, Article, Comment }