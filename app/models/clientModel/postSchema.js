const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, trim: true },
    content: { type: String, trim: true },
    contentPhoto: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: Schema.Types.ObjectId, ref: 'Post' },
    answerTo: { type: Schema.Types.ObjectId, ref: 'Post' },
    pinned: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Post',PostSchema)