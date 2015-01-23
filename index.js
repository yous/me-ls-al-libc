var config = require("config");
var express = require("express");
var swig = require("swig");

var app = express();
app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

app.get("/", function (req, res) {
	res.render("index");
});

var server = app.listen(config.server.port, config.server.host, function () {
	console.log("Listening at http://%s:%s", server.address().address, server.address().port);
});
