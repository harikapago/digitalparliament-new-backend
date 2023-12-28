const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
 
  postType: {
    type: String,
    required: true,
  },
  postCategory: {
    type: String,
    required: true,
  },
  postShortDescription: {
    type: String,
    required: true,
    
  },
  postLongDescription: {
    type: String,
    required: true,
  },
  createdDateTime: {
    type: Date,
    default: Date.now,
  },
  mediaFilePath: {
    type: String,
    required: true,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
});

const MakePost = mongoose.model('MakePost', postSchema);

module.exports = MakePost;
