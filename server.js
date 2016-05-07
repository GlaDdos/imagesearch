var express       = require('express');
var app           = express();
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var Cub           = require('./app/models/cub.js');
var https         = require('https');

var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/urlbase');
var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', function(){
      console.log('MongoDB connected successfully on port ' + port);
    });


var router = express.Router();


router.use( function(request, response, next){
  next();
});

router.route('/api/search/:search_q')
  .get(function(request, response){
    var searchData = request.params.search_q;
    var offset = Number(request.query.offset);

    console.log('Search data: ' + searchData);
    console.log('Offset: ' + offset);

    var cub = new Cub();

    cub.term = searchData;
    cub.save(function(err){
      if(err)
        throw err;
    });

    makeRequest(searchData, offset, function(parser){
      response.json(parser);
    });
  });

router.route('/api/latest')
  .get(function(request, response){
    Cub.find({}, { _id: 0, term: 1, when: 1 }, { limit: 5, sort: { when: -1 } },function(err, data){

      if(err)
        throw err;

      response.json(data);
    });
  });

router.route('/')
  .get(function(request, response){
    response.send('HEYA');
  });

app.use('/', router);
app.listen(port);

console.log('Node is listening on port: ' + port);

function makeRequest(searchData, offset, callback){

  if( isNaN(offset)  || (offset === 0)){
    console.log(typeof offset);
    offset = 1;
  }

  var query = 'https://www.googleapis.com/customsearch/v1?q=' + searchData +
              '&cx=010071501139995967600%3Auih2vqc8jbw&imgType=photo&num=10&safe=medium&searchType=image&key=AIzaSyDMueHa227lT-UC3_NQt7NXFVgtr58AjLk&start=' +
              (offset * 10) + '';

  return https.get(query, function(response){
    var body = '';
    response.on('data', function(d){
      body += d;
    });

    response.on('end', function(){
      body = JSON.parse(body);
      var parsed = [];

      body.items.forEach( function(data){
        parsed.push({
          link:     data.link,
          snippet:  data.snippet,
          context:  data.image.contextLink,
          thumbnail:data.image.thumbnailLink
        });
      });


      callback(parsed);
    });
  });
}
