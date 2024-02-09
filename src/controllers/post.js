import mongoose from 'mongoose';
import Post from '../models/post.model.js';

export const getPosts = async (req, res) => {
  try {
    //TODO: when the clint work is ready we need to fix this, the steps and info below
    // const url = `http://yourserver.com/endpoint?ids=${idArray.join(',')}`;
    // the above is an example for how to pass array of ids when making a request to this api
    // const ids = req.query.ids.split(',');
    // console.log('ids', ids);

    const ids = [
      '65c59046b3c73bf9c23b5e3a',
      '65c59046b3c73bf9c23b5e3b',
      '65c59046b3c73bf9c23b5e3c',
    ];
    const posts = await Post.find({ _id: { $in: ids } });
    console.log('posts length', posts.length);
    return res
      .status(200)
      .json({ success: true, message: 'got posts successfully', posts });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { getPosts };
