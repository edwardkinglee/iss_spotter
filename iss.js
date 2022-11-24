const request = require('request');
const api = 'https://api.ipify.org/?format=json';
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API

  request(api, (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    const ip = JSON.stringify(body);
    //console.log(typeof ip);
    return callback(null, ip);

  });

};

module.exports = { fetchMyIP };