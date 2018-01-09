const https = require('https')
const fs = require('fs')
const webhookUri = require('./config').slack_webhook_url
const OldReviewData = fs.readFileSync('./review.json', 'utf8') || ''
const Slack = require('slack-node');

const sendSlackWebHook = (data) => {
	const { overall_rating, reviews } = data
	const newestReview = reviews[0]
	console.log(overall_rating, newestReview)
	const rate = Number(newestReview.star_rating)
	const color = rate === 5 ? 'good' : rate < 4 && rate > 2 ? 'warning' : 'danger'
	const slack = new Slack();
	slack.setWebhook(webhookUri);
	slack.webhook({
		channel: "#reviews",
		username: "webhookbot",
		text: "Notification about PageFly reviews update",
		"attachments": [
			{
				"fallback": JSON.stringify(newestReview),
				color,
				"pretext": "",
				"author_name": "PageFly Reviews Bot",
				"author_link": "https://apps.shopify.com/pagefly",
				"author_icon": "https://cdn.shopify.com/s/files/applications/f85ee597169457da8ee70b6652cae768_512x512.png",
				"title": newestReview.shop_name,
				"title_link": "https://"+ newestReview.shop_domain,
				"text": newestReview.body,
				"fields": [
					{
						"title": "New Rating:",
						"value": newestReview.star_rating + ' star',
						"short": false
					}
				],
				"image_url": "http://my-website.com/path/to/image.jpg",
				"thumb_url": "http://example.com/path/to/thumb.png",
				"footer": " ",
				"footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
				"ts": Math.floor((new Date).getTime()/1000)
			}
		]
	}, function(err, response) {
		console.log(response);
	});

}
const SlackWebHook = () => {
	console.log('collecting PageFly reviews data...')
	https.get('https://apps.shopify.com/pagefly/reviews.json', (resp) => {
		let data = ''
		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk
		})

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			fs.writeFileSync('./review.json', data)
			if (data !== OldReviewData) {
				const newReviewData = JSON.parse(data)
				sendSlackWebHook(newReviewData)
			} else {
				console.log('no update about reviews on PageFly!')
			}
		})

	}).on('error', (err) => {
		console.log('Error: ' + err.message)
	})

}

module.exports = SlackWebHook