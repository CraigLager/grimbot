// https://blog.mousereeve.com/api-access-to-grimoire-org/
require('dotenv').config();

var request = require('sync-request');
var chalk = require('chalk');
var twitter = require('twitter');

main();

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

    var length = excerpt.identifier.length * 2 + 5 + "https://www.grimoire.org/excerpt/".length;
    var remaining = 140 - length;
    var contents = excerpt.content.substring(0, remaining);

    client.post('statuses/update', { status: excerpt.identifier + "\n" + contents + "...\n" + 'https://www.grimoire.org/excerpt/' + excerpt.uid }, function(error, tweet, response) {
        if (error) throw error;
        //console.log(tweet);  // Tweet body. 
        //console.log(response);  // Raw response object. 
        console.log("Reading finished.")
    });

}

/*
Description: gets a random excerpt from a grimoire
Pamameters:
    grimoire: the grimoire to get an excerpt from
Returns: an excerpt. Undefined if grimoire is empty (???)
*/
function getRandomExcerpt(grimoire) {
    var res = request('GET', 'https://www.grimoire.org/api/v1/node/' + grimoire.uid + '/excerpt');
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
    var res = request('GET', 'https://www.grimoire.org/api/v1/label/grimoire');
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
