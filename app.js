var express = require('express')
var app = express()
var organizations = require('./scrapeOrgs.js')
app.get('/update', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	res.status(200);  
	var orgs = organizations(function(response){
		var object = {}; 
		object['organizations'] = response; 
		res.send(JSON.stringify(object)); 
	}); 
}); 

app.listen('3000', function(){
	console.log('App listening on port 3000'); 
}); 
