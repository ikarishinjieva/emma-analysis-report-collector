var data = {};

exports.get = function() {
	var domain_id, ans = [];
	for (domain_id in data) {
		for (var i = 0 ; data[domain_id] != null && i < data[domain_id].items.length ; i++) {
			ans.push({
				domain_id : domain_id,
				filename : data[domain_id].items[i].filename,
				module : data[domain_id].items[i].module,
				to_qa : data[domain_id].items[i].to_qa
			});
		}
	}	
	return ans;
}

var get_module = function(namespace) {
	ns_map = [
		['.mocksrreceive', 'SR Interface'],
		['.costfree', 'Profile'],
		['.sppm' , 'SPPM'],
		['.systemsetting' , 'System Setting'],
		['.order.tp' , 'TP'],
		['.tp' , 'TP'],
		['interfaces.sr' , 'SR Interface'],
		['.sr', 'SR'],
		['.order' , 'Order'],
		['.finance' , 'Ap Billing Rpt'],
		['.billing.nt' , 'NT Billing'],
		['.nt' , 'NT Billing'],
		['.billing.t' , 'T Billing'],
		['.billing' , 'Billing'],
		['.vtm.tariff' , 'Tariff'],
		['.vtm.contract' , 'Contract'],
		['.vtm.chargegroup' , 'Charge Group'],
		['.vtm.chargeitem' , 'Charge Item'],
		['.vtm' , 'VTM'],
		['.profile' , 'Profile'],
		['.commonbiz' , 'Common'],
		['.cache' , 'Common'],
		['.common' , 'Common'],
		['.auth' , 'Common']
	]
	for (var i = 0 ; i < ns_map.length ; i++) {
		var ns = ns_map[i];
		if (namespace.indexOf(ns[0]) !== -1) {
			return ns[1];
		}
	}
	return 'UNCLASSFIED';
}

var add_file = function(domain_id, filename, content) {
	var namespace = content.match(/<a[^>]*>all&nbsp;classes<\/a>[^<]*<a[^>]*>([^<]+)<\/a>/)[1]
	var module = get_module(namespace)
	data[domain_id] = data[domain_id] || {items : []};
	var matches = content.match(/@QA(\s|&nbsp;)+(?:(?!<[^>]*>).|\n|\s)+/mg) || [];
	for (var i = 0 ; i < matches.length ; i++) {
		var match = matches[i];
		data[domain_id].items.push({
			filename : filename,
			module : module,
			to_qa : match
		});		
	}
}

var add = function(domain_id, files) {
	data[domain_id] = undefined;
	
	if (!(files instanceof Array)) {
		files = [files]
	}
	
	for (var i = 0 ; i < files.length ;i++) {
		(function() {
			var path = files[i].path;
			var filename = files[i].name;
			require('fs').readFile(path, function(err, file) {
				if (err) {
					throw err;
				}
				var content = file.toString('utf8');
				add_file(domain_id, filename, content); 
			});
		})();
	}
}

exports.add = add;

var load = function() {
	var fs = require('fs');
	fs.exists('data.json', function(exists) {
		if (exists) {
			fs.readFile('data.json', function(err, text) {
				if (err) throw err;
				data = JSON.parse(text);
			});
		}
	});	
}

var beginSync = function() {
	load();
	var syncFn = function() {
		var fs = require('fs');
		fs.writeFile('data.json', JSON.stringify(data), function(err) {
			if (err) throw err;
			setTimeout(syncFn, 60000);
		});
	}
	setTimeout(syncFn, 60000);
}
exports.beginSync = beginSync;