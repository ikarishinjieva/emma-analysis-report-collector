var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var reporter = require('./reporter');

process.on("uncaughtException", function(err) {
		console.error(err);
		console.error(err.stack);
	});
	
var formidable = require('formidable'),
    http = require('http'),
    util = require('util');

var loadFile = function(realpath, request, response) {	
	fs.exists(realpath || 'index.html', function(exists) {
		if (!exists) {
			throw 'wrong url : ' + request.url
		} else {
			fs.readFile(realpath, "binary", function(err, file) {
				if (err) {
					response.writeHead(500, {'Content-Type': 'text/plain',
						"Access-Control-Allow-Origin" : "*"});
					response.end(err);
				} else {
					response.writeHead(200, {'Content-Type': 'text/html',
						"Access-Control-Allow-Origin" : "*"
						});
					response.write(file, "binary");
					response.end();
				}
			});
		}
	});	
}
	
http.createServer(function(req, res) {
	if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		var files = []
		form.on('file', function(name, file) {
			files.push(file);
		});
		form.parse(req, function(err, fields, no_use) {
			reporter.add(fields.domain_id, files);
			res.statusCode = 302;
			res.setHeader("Location", "/index.html");
			res.end();
		});
		return;
	}
	
	if (req.url == '/report.json') {
		res.writeHead(200, {'content-type': 'text/plain'});
		res.write(JSON.stringify(reporter.get()));
		res.end();
		return;
	}

	var realpath = url.parse(req.url).pathname.slice(1);
	loadFile(realpath, req, res);
}).listen(1110, function() {
	reporter.beginSync();
	console.log("Server started @ 1110");
});