var express = require('express')
var app = express()
var organizations = require('./scrapeOrgs.js')
app.get('/update', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	res.status(200);
	var orgs = organizations.main(function(response){
		var object = {};
		object['organizations'] = response;
		console.log("Organization list updated!");
		// Uncomment this to see output on server side
		//console.log(JSON.stringify(object));
		res.send(JSON.stringify(object));
	});
});

app.get('/details/:orgId', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var orgId = req.params.orgId
	organizations.getOrgDetails(orgId, function(response) {
			if (response["orgName"] == "Not Found") {
				res.status(404)
			}
			else {
				res.status(200)
			}
			// Uncomment this to see output on server side
			console.log(response)
			res.send(response)
	});
});


app.listen('3000', function(){
	console.log('App listening on port 3000');
});
