var http = require('http')
var firebase = require('firebase')
var os = require('os')
// Set the configuration for your app
var config = {
  apiKey: "AIzaSyAXzz7n47GPvxG1PFmlfrhdNnfbpvfDxU8",
  authDomain: "chorus-ad084.firebaseapp.com",
  databaseURL: "https://chorus-ad084.firebaseio.com/"
};
firebase.initializeApp(config);

// Get a reference to the database service
var dbRef = firebase.database().ref("organizations");
/**
 * Removes the anchor tags from the input.
 */
function extractNames(rawData, extractionCallback){
  var lines = rawData.split(os.EOL);
  var organizations = [];

  // Preprocess the list of organizations
  lines.forEach(function(line){
    if (line.includes("<a class=\"orgLink\"")){
      line = line.replace("</a>", "")
      line = line.substring(line.indexOf(">")+1)
      line = line.replace("\r", "")
      organizations.push(line)
    }
  })

  // Save off the length of the number of organizations
  var length = organizations.length;

  // Push each organization to the Firebase DB
  organizations.forEach(function(org, index){
    var newOrg = dbRef.child(index);
    newOrg.set(org).then(function(){
      if (index == length - 1){
        // Call the callback with the organizations
        extractionCallback(organizations);
      }
    });
  })
}

/**
 * Perform a http request to the student organization site, and pass the
 * result with a callback to extractTitles
 */
var getOrgs = function(getOrgsCallback){
  var organizations;
  http.get('http://studentorg.ucsd.edu', (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function(chunk) { rawData += chunk });
    res.on('error', function(err){
      console.log(err)
    });
    res.on('end', function()  {
      try {
        if (res.statusCode == 200){
          // First finish the removing the old references
          dbRef.remove(function(error){
            if (!error){
              // Extract the names of the students organizations
              // Get it with a callback
              extractNames(rawData, function(organizations) {
                getOrgsCallback(organizations)
              } );
            }
          });
        }
      } catch (e) {
        console.log(e.message);
      }
    });
  })
}

// Main method initiates callback chain
var main = function(getOrganizations) {
  getOrgs(function(orgs){getOrganizations(orgs)});
}

module.exports = main;
