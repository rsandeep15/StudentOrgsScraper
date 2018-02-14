var http = require('http')
var os = require('os')
var JSSoup = require('jssoup').default;
// Get a reference to the database service
/**
 * Removes the anchor tags from the input.
 */
function extractNames(rawData, extractionCallback){
  var lines = rawData.split(os.EOL);
  var organizations = [];
  var soup = new JSSoup(rawData);
  var tableRows = soup.findAll('td');
  // Preprocess the list of organizations
  tableRows.forEach(function(row) {
    organizations.push(row.nextElement.getText());
  });
  extractionCallback(organizations)

  // Save off the length of the number of organizations
  var length = organizations.length;
}

var getOrgDetails = function(orgId, getOrgCallback) {
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
            var matchName = "<span id=\"MainContent_fvOrgDetail_lblOrgName\" class=\"header\">"
            var matchDescription = "<span id=\"MainContent_fvOrgDetail_lblPurpose\">"
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

var getCSECapes = function(getCapesCb) {
  http.get({
    hostname: 'cape.ucsd.edu',
    path: '/responses/Results.aspx?courseNumber=CSE',
    headers: {
      'User-Agent': 'Mozilla'
    }
  },
  (res) => {
    var rawData = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {rawData += chunk})
    res.on('end', function(){
      var soup = new JSSoup(rawData);
      var tableRows = soup.findAll('tr');
      var results = [];
      tableRows.forEach(function(row) {
        var capeEntry = {};
        var profSoup = row.nextElement;
        var courseSoup = profSoup.nextSibling;
        var termSoup = courseSoup.nextSibling;
        var enrollSoup = termSoup.nextSibling;
        var studyHrSoup = enrollSoup.nextSibling.nextSibling.nextSibling.nextSibling;
        var avgSoupExp = studyHrSoup.nextSibling;
        var avgSoupRec = avgSoupExp.nextSibling;
        capeEntry['professor'] = profSoup.getText();
        capeEntry['course'] = courseSoup.getText();
        capeEntry['term'] = termSoup.getText();
        capeEntry['enroll'] = enrollSoup.getText();
        capeEntry['studyHr'] = studyHrSoup.getText();
        capeEntry['avgExp'] = avgSoupExp.getText();
        capeEntry['avgRec'] = avgSoupRec.getText();
        results.push(capeEntry);
      });
      getCapesCb(results);
     });
  });
}

module.exports = {getOrgs: getOrgs,
  getOrgDetails: getOrgDetails,
  getCSECapes: getCSECapes};
