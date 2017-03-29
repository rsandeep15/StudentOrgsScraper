# UCSD Students Orgs API 
A Node.js Script to get all student organizations at UCSD

GET /update
- Returns a live list of active student organizations at UCSD as a JSON array. 

GET /details/:orgId
- Returns the org name and the details of the organization as a JSON object. 

Simply run `node app.js` and navigate to endpoint /update on your browser.
App runs on port 3000. 

Live Demo: http://52.38.85.90/update
