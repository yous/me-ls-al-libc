var config = require("config");
var express = require("express");
var swig = require("swig");
var Q = require("Q");
var MongoClient = require("mongodb").MongoClient;

var symbols = require("./libc-binary-collection/symbols.json");

var app = express();
app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

MongoClient.connect(config.mongo.url, function (err, db) {
	if (err) {
		throw err;
	}

	db.collection("libc", function (err, col) {
		if (err) {
			throw err;
		}

		app.get("/", function (req, res) {
			var query = {};
			var empty = true;
			for (var key in req.query) {
				if (req.query.hasOwnProperty(key)) {
					empty = false;
					query["symbols." + key] = {"$mod": [0x1000, parseInt(req.query[key]) & 0xFFF]};
				}
			}

			if (empty) {
				res.render("index", {libc: []});
			}
			else {
				console.log("Querying %s", JSON.stringify(query));
				col.find(query, {name: 1}).toArray(function (err, docs) {
					if (err) {
						res.render("index", {libc: []});
						throw err;
					}

					res.render("index", {libc: docs});
				});
			}
		});

		var promises = [];
		for (var key in symbols) {
			if (symbols.hasOwnProperty(key)) {
				var deferred = Q.defer();
				promises.push(deferred.promise);

				(function (key, deferred) {
					col.count({name: key}, function (err, count) {
						if (err) {
							throw err;
						}

						if (count == 0) {
							console.log("Adding %s", key);

							for (var sym in symbols[key]) {
								if (symbols[key].hasOwnProperty(sym) && sym.indexOf(".") != -1) {
									delete symbols[key][sym];
								}
							}

							col.insert({name: key, symbols: symbols[key]}, function (err, res) {
								if (err) {
									throw err;
								}

								deferred.resolve();
							});
						}
						else {
							deferred.resolve();
						}
					});
				})(key, deferred);
			}
		}

		Q.all(promises).then(function () {
			var server = app.listen(config.server.port, config.server.host, function () {
				console.log("Listening at http://%s:%s", server.address().address, server.address().port);
			});
		});
	});
});
