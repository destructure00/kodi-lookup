var express = require('express');
var app = express();
var request = require('request');
const serverPort = 8078;


app.get('/kodi-lookup', function (req, res) {
  if (!req.query) return res.sendStatus(400)
  console.log(req.query);
  var movie_title = req.query.movie_title.toLowerCase().replace('the ','');
  var kodi_ip = req.query.kodi_ip;
  if (movie_title && kodi_ip){
    res.send('Searching for ' + movie_title + ' on ' + kodi_ip);
    console.log('Searching for ' + movie_title + ' on ' + kodi_ip);
    var options = {
      uri: 'http://'+kodi_ip+':8080/jsonrpc?request={"jsonrpc":"2.0", "method":"VideoLibrary.GetMovies", "id":1}',
      method: 'GET',
      json: true
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
	var jsonBody = JSON.stringify(body);
	console.log(jsonBody);

	var nameList = jsonBody.split('"label":"');

	console.info("Found " + nameList.length + " movies in library");
	
	var movieCount = nameList.length;
	var i;

	for(i = 0; i < movieCount; i++) {
		var endPos = nameList[i].indexOf('"');	
		nameList[i] = nameList[i].substring(0,endPos).toLowerCase().replace('the ','');
		console.info(nameList[i]);
	}

	var movieId = nameList.indexOf(movie_title);
	console.info("Found match, movieId: " + movieId);
	play(kodi_ip, movieId);
      } 
    });
  }else{
    res.send('Error');
  }

})
app.listen(serverPort);
console.log("Listening on port "+serverPort);


function play (kodi_ip, movieID) {
var options = {
      uri: 'http://'+kodi_ip+':8080/jsonrpc?request={"jsonrpc":"2.0", "method":"Player.Open", "id":1,"params":{"item":{"movieid":' + movieID + '}}}',
      method: 'GET',
      json: true
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
	console.log("Sending play command to " + kodi_ip);
	console.log(body);
      } 
    });
}


