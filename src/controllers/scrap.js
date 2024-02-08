import scrapFacebook from '../utillites/scrapFacebook.js';

export const scrap = async (req, res) => {
  try {
    // TODO: follow the task by order to achieve results
    //#1 - query user table to check for subscriped users feild set to true (many users)
    //#2 - get the _id, facebookUrl
    //#3 - use the facebookUrl to scrapFacebook
    //#4 - scrapFacebook will return array use the postId to check it against the posts table that would match with the postId and then filter the one that are not found in db and insert them and send notification to inform the client about the new posts which are the ones are not in db yet
    //#5 - repeat the process for all users in user with subscribed set to true
    console.log('Signup information', req.body);
    return res.status(200).json({ message: 'endpoint hit' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { scrap };
