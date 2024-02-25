import googleMaps from '@google/maps';
import chalk from 'chalk';
const calculateDistance = async (address1, address2, radius) => {
  const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

  const googleMapsClient = googleMaps.createClient({
    key: `${GOOGLE_MAP_API_KEY}`, // Replace with your API key
    Promise: Promise, // 'Promise' can be any Promise/A+ compatible constructor.
  });
  googleMapsClient
    .distanceMatrix({
      origins: [address1],
      destinations: [address2],
      mode: 'driving', // can also be 'walking', 'bicycling', or 'transit'
      units: 'metric', // Use 'metric' for kilometers or 'imperial' for miles
    })
    .asPromise()
    .then((response) => {
      // The distance and duration will be obtained from the response
      const distance = response.json.rows[0].elements[0].distance;
      const duration = response.json.rows[0].elements[0].duration;

      const d = distance?.text.replace(' km', '');
      console.log(
        `Distance: ${distance?.text}, Duration: ${
          duration?.text
        } ${chalk.blueBright(parseInt(radius) >= parseInt(d))}`
      );
      return parseInt(radius) >= parseInt(d);
    })
    .catch((err) => {
      console.error(err);
      console.log('error', err);
      return { success: false, message: err };
    });
};

export default calculateDistance;
