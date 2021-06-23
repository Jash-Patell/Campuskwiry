const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: {type: String, default: 'user'}, 
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User',UserSchema)