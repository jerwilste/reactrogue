var path = process.cwd();

module.exports = function (app) {

    app.route('/')
		.get(function (req, res) {
		    res.sendFile(path + '/test.html');
		});
}