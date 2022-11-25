const request = require('request');
const api = 'http://ipwho.is/';
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
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

const fetchCoordsByIP = (ip, callback) => {
  request(api + ip, (error, response, data) => {
    if (error) {
      return callback(error, null);
    }

    // parse the returned body so we can check its information
    const parsedBody = JSON.parse(data);
    // check if "success" is true or not
    if (!parsedBody.success) {
      const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
      callback(Error(message), null);
      return;
    }
    const dataObject = JSON.parse(data);
    const latitude = JSON.stringify(dataObject.latitude);
    const longitude = JSON.stringify(dataObject.longitude);

    return callback(null, { latitude, longitude });

  });

};

module.exports = { fetchMyIP, fetchCoordsByIP };