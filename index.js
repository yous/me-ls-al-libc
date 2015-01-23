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

	app.get("/", function (req, res) {
		res.render("index");
	});

	db.collection("libc", function (err, col) {
		if (err) {
			throw err;
		}

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
