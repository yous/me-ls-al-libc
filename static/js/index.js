function addKeyValue(key, value) {
	$(".keyvalue-last").append('<div class="col-xs-2"><button type="button" class="btn btn-danger" tabindex="-1"><span class="glyphicon glyphicon-remove"></span></button></div>');
	$(".keyvalue-last button").click(function () {
		$(this).parent().parent().remove();
	});
	$(".keyvalue-last").removeClass("keyvalue-last");
	$(".keyvalue-container").append('<div class="row keyvalue keyvalue-last" style="margin-bottom: 10px"><div class="col-xs-5"><input type="text" class="form-control keyvalue-key" placeholder="Function"></div><div class="col-xs-5"><input type="text" class="form-control keyvalue-value" placeholder="Address"></div></div>');
	$(".keyvalue-last input.keyvalue-key").val(key);
	$(".keyvalue-last input.keyvalue-value").val(value);
	$(".keyvalue-last input").focus(function () {
		if ($(this).parent().parent().hasClass("keyvalue-last")) {
			addKeyValue();
		}
	});
}

function submitKeyValue() {
	var query = {};
	$(".keyvalue").each(function () {
		var key = $(this).find(".keyvalue-key").val();
		var value = $(this).find(".keyvalue-value").val();
		if (key && value) {
			query[key] = value;
		}
	});
	window.location.href = "/?" + $.param(query);
}
