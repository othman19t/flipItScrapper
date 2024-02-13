import User from '../models/User.model.js';

export const Signup = async (req, res) => {
  try {
    console.log('Signup information', req.body);
    const emailToCheck = req.body.email;
    const user = await User.findOne({ email: emailToCheck });
    // if user is found, email exists
    if (user != null) {
      return res
        .status(400)
        .json({ success: flase, message: 'Email already exists' });
    }
    const dataToSave = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      facebookUrl: req.body.facebookUrl,
      subscribed: req.body.subscribed,
      offerUpUrl: req.body.offerUpUrl,
      craiglistUrl: req.body.craiglistUrl,
    };
    const newUser = new User(dataToSave);
    await newUser.save();
    console.log('helloworld!');

    res.status(201).json({
      success: true,
      message: 'user saved successfully',
      userId: newUser._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { Signup };
