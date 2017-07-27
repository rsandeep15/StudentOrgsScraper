# UCSD Students Orgs API 
An API built on Node and Express to retrieve useful information about student run organizations at UC San Diego. 

GET /update
- Returns a live list of active student organizations at UCSD as a JSON array. 

GET /details/:orgId
- Returns the org name and the details of the organization as a JSON object, given an orgId.

Simply run `node app.js` and navigate to an endpoint on your browser for local testing. 
App runs on port 3000 by default.
