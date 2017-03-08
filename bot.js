// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config');

var Twitter = new twit(config);

var TwitterBot = function() {

// RETWEET BOT ==========================

// find latest tweet according the query 'q' in params
var retweet = function() {
    var params = {
        q: '@nodejs OR #nodejs OR #reactjs OR #mongodb OR @reactjs OR #react OR @mongodb OR #mernstack @mernstack OR @npmjs OR #php OR @php OR @javascript OR #javascript OR @functional OR #functional OR @es6 OR #es6 OR @es2017 OR #es2017 OR @redux OR #redux OR @reduxsaga OR #reduxsaga OR @graphql OR #graphql',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    }
    Twitter.get('search/tweets', params, function(err, data) {
        // if there no errors
        if (!err) {
            // grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell TWITTER to retweet
            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (response) {
                    console.log('Retweeted!!!');
                }
                // if there was an error while tweeting
                if (err) {
                    console.log('Something went wrong while RETWEETING... Duplication maybe...');
                }
            });
        }
        // if unable to Search a tweet
        else {
            console.log('Something went wrong while SEARCHING...');
        }
    });
};

// grab & retweet as soon as program is running...
retweet();

setInterval(retweet, 3600000);

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function(){
    var params = {
        q: '@nodejs OR #nodejs OR #reactjs OR #mongodb OR @reactjs OR #react OR @mongodb OR #mernstack @mernstack OR @npmjs OR #php OR @php OR @javascript OR #javascript OR @functional OR #functional OR @es6 OR #es6 OR @es2017 OR #es2017 OR @redux OR #redux OR @reduxsaga OR #reduxsaga OR @graphql OR #graphql',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    }
    // find the tweet
    Twitter.get('search/tweets', params, function(err,data){

        // find tweets
        var tweet = data.statuses;
        var randomTweet = ranDom(tweet);   // pick a random tweet

        // if random tweet exists
        if(typeof randomTweet != 'undefined'){
            // Tell TWITTER to 'favorite'
            Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
                // if there was an error while 'favorite'
                if(err){
                    console.log('CANNOT BE FAVORITE... Error');
                }
                else{
                    console.log('FAVORITED... Success!!!');
                }
            });
        }
    });
}
// grab & 'favorite' as soon as program is running...
favoriteTweet();

setInterval(favoriteTweet, 4800000);

// function to generate a random tweet tweet
function ranDom (arr) {
    var index = Math.floor(Math.random()*arr.length);
    return arr[index];
};
}

module.exports = TwitterBot;
