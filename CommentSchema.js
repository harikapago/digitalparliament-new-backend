const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: {
      type: String, 
    required: true,
  },
  postedBy: {
    type: String, 
    required: true,
  },
  postedTime: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    required: true,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
