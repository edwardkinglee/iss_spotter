const request = require('request');

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

  request('https://api.ipify.org?format=json', (error, response, body) => {

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
    const ip = JSON.parse(body).ip;
    //console.log(typeof ip);
    return callback(null, ip);

  });

};

const fetchCoordsByIP = (ip, callback) => {
  request('http://ipwho.is/' + ip, (error, response, data) => {
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

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      callback(error, null);
      return;
    }
  
    fetchCoordsByIP(ip, (error, data) => {
      if (error) {
        callback(error, null);
        return;
      }
      
      fetchISSFlyOverTimes(data, (error, passTimes) => {
        if (error) {
          callback(error,null);
          return;
        }

        return callback(null, passTimes);
      });
    });


  });
};

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };

//`https://iss-flyover.herokuapp.com/json/?lat=49.27670&$lon=-123.13000

//https://iss-flyover.herokuapp.com/json/?lat=49.2767&lon=-123.13000