import mongoose from 'mongoose';
import Post from '../models/Post.model.js';

export const getPosts = async (req, res) => {
  try {
    const ids = req.query.ids.split(',');
    console.log('ids: ', ids);
    const posts = await Post.find({ _id: { $in: ids } });
    console.log('posts length', posts.length);
    return res
      .status(200)
      .json({ success: true, message: 'got posts successfully', posts });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ userId })
      .limit(100)
      .sort({ createdAt: -1 });

    console.log('posts length', posts.length);
    return res
      .status(200)
      .json({ success: true, message: 'got posts successfully', posts });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { getPosts, getAllPosts };
