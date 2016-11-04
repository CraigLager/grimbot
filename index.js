require('dotenv').config();
var request = require('sync-request');
var chalk = require('chalk');
var twitter = require('twitter');

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
//console.log(excerpt.content);
console.log('https://www.grimoire.org/' + excerpt.uid);

function tweetExcerpt(excerpt){

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

  client.post('statuses/update', {status: 'I Love Twitter'},  function(error, tweet, response) {
  if(error) throw error;
  console.log(tweet);  // Tweet body. 
  console.log(response);  // Raw response object. 
});

}

function getRandomExcerpt(grimoire) {
    var res = request('GET', 'https://www.grimoire.org/api/v1/node/' + grimoire.uid + '/excerpt');
    var data = JSON.parse(res.getBody('utf8'));
    var selectedExcerpt = data[rand(0, data.length - 1)];

    return selectedExcerpt;
}

function getRandomGrimoire() {
    var data = require('./grimoires.json');
    var selectedGrimoire = data[rand(0, data.length - 1)].props;
    return selectedGrimoire;
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
