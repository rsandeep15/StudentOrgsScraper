var http = require('http')
var firebase = require('firebase')
var os = require('os')
// Set the configuration for your app
var config = {
  apiKey: "AIzaSyAXzz7n47GPvxG1PFmlfrhdNnfbpvfDxU8",
  authDomain: "chorus-ad084.firebaseapp.com",
  databaseURL: "https://chorus-ad084.firebaseio.com/",
  //  storageBucket: "bucket.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var dbRef = firebase.database().ref("organizations");


//Clear the organizations list if it exists
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
  var length = organizations.length;
  organizations.forEach(function(org, index){
    var newOrg = dbRef.push();
    newOrg.set(org).then(function(){
      if (index == length - 1){
        // go offline after last data point is added
        console.log("done!")
	extractionCallback(organizations); 
      }
    });
  })
  dbRef.on('child_added', function(data){
    //console.log(data.val());
  });
}

// Perform a http request to the student organization site
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
              	extractNames(rawData, function(organizations) { getOrgsCallback(organizations) } );
	    } 
          });
        }
      } catch (e) {
        console.log(e.message);
      }
    });
  })
}

var main = function(getOrganizations) {
	getOrgs(function(orgs){getOrganizations(orgs)}); 
}

module.exports = main; 
