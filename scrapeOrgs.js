var http = require('http')
var os = require('os')

// Get a reference to the database service
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
}

var getOrgDetails = function(orgId, getOrgCallback) {
  var details;
  http.get('http://studentorg.ucsd.edu/RdOnlyDetail.aspx?data=' + orgId,
    (res) => {
      var rawData = '';
      res.setEncoding('utf8')
      res.on('data', function(chunk) {rawData += chunk})
      res.on('end', function(){
        var response = {}
        if (res.statusCode == 200) {
          var lines = rawData.split(os.EOL)
          // Preprocess the list of organizations
          lines.forEach(function(line){
            let matchName = "<span id=\"MainContent_fvOrgDetail_lblOrgName\" class=\"header\">"
            let matchDescription = "<span id=\"MainContent_fvOrgDetail_lblPurpose\">"
            if (line.includes(matchName)){
              line = line.replace(matchName, "").replace("<h2 class=\"header\">", "").replace("</h2>", "").trim()
              response["orgName"] = line
            }
            if (line.includes(matchDescription)) {
              line = line.replace(matchDescription, "").replace("</span>", "").trim();
              response["description"] = line
            }
          })
        }
        else {
          response["orgName"] = "Not Found"
          response["description"] = "Not Found"
        }
        getOrgCallback(response)
      })
    });
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
          extractNames(rawData, function(organizations) {
            getOrgsCallback(organizations)
        })
      }
      } catch (e) {
        console.log(e.message);
      }
    });
  })
}

// Main function initiates callback chain
var main = function(getOrganizations) {
  getOrgs(function(orgs){getOrganizations(orgs)});
}


module.exports = {main: main, getOrgDetails: getOrgDetails};
