    // https://blog.mousereeve.com/api-access-to-grimoire-org/
require('dotenv').config();

var request = require('sync-request');
var chalk = require('chalk');
var twitter = require('twitter');

exports.handler = function index() {
    main();
}

/*
Description: main process
Pamameters: none
Returns: nothing
*/
function main() {

    var excerpt;

    while (excerpt === undefined) {
        console.log("Searching library");

        var grimoire = getRandomGrimoire();

        excerpt = getRandomExcerpt(grimoire);

        if (excerpt == undefined) {
            console.log(chalk.yellow('Putting ' + grimoire.identifier + ' back on the shelf'));
        }
    }

    excerpt = excerpt.props;

    console.log("");
    console.log(chalk.red("Reading from " + grimoire.identifier));
    console.log("-----------------------------------------")
    console.log(excerpt.identifier);
    console.log('https://www.grimoire.org/' + excerpt.uid);

    tweetExcerpt(excerpt);
}

/*
Description: cleans up excerpt content
Pamameters:
    content to clean up
Returns: cleaned content
*/
function cleanContent(content)
{
    content = content.replace("<pre>","").replace("</pre>","").replace("<PRE>","").replace("</PRE>","");
}

/*
Description: tweets an excerpt using credentials set in env
Pamameters:
    excerpt: the excerpt to tweet
Returns: nothing
*/
function tweetExcerpt(excerpt) {
    var client = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    var url = shortenUrl('https://www.grimoire.org/excerpt/' + excerpt.uid);
    console.log(url);
    var length = (excerpt.identifier + "\n" + "...\n" + url).length;
    //console.log(length);

    var remaining = 140 - length - 2;
    var contents = excerpt.content.substring(0, remaining);

    console.log((excerpt.identifier + "\n" + contents + "...\n" + url).length);

    client.post('statuses/update', { status: excerpt.identifier + "\n" + contents + "...\n" + url }, function(error, tweet, response) {
        if (error){
            console.log(error);
          throw error;  
        } 
    });
}

/*
Description: gets a random excerpt from a grimoire
Pamameters:
    grimoire: the grimoire to get an excerpt from
Returns: an excerpt. Undefined if grimoire is empty (???)
*/
function getRandomExcerpt(grimoire) {
    var res = request('GET', 'https://www.grimoire.org/api/v1/node/' + grimoire.uid + '/excerpt?limit=1&random=true');
    var data = JSON.parse(res.getBody('utf8'));
    var selectedExcerpt = data[rand(0, data.length - 1)];
    return selectedExcerpt;
}

/*
Description: gets a random grimoire
Pamameters: none
Returns: random grimoire
*/
function getRandomGrimoire() {
    //https://www.grimoire.org/api/v1/label/grimoire
    var res = request('GET', 'https://www.grimoire.org/api/v1/label/grimoire?limit=1&random=true');
    var data = JSON.parse(res.getBody('utf8'));
    var selectedGrimoire = data[rand(0, data.length - 1)].props;
    return selectedGrimoire;
}

/*
Description: get a random int
Pamameters:
    min: minimum number (inclusive)
    max: maximum number (exclusive)
Returns: a random number
*/
function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/*
Description: shorten a URL
Parameters:
    url: url to shorten
Returns: bitly url
*/
function shortenUrl(url){
    var res = request('GET', 'https://api-ssl.bitly.com/v3/shorten?access_token=' +  process.env.BITLY_OAUTH + '&longUrl=' + encodeURI(url));
    var data = JSON.parse(res.getBody('utf8'));
    return data.data.url;
}