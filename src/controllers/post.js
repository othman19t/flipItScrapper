import mongoose from 'mongoose';

export const getPosts = async (req, res) => {
  try {
    //TODO:
    //#1 you will receive ids of post retrive them and send them back to clint
    console.log('Signup information', req.body);
    return res.status(200).json({ message: 'get posts endpoint hit' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { getPosts };
