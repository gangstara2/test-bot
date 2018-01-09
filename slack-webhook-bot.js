const https = require('https')
const fs = require('fs')
const webhookUri = require('./config').slack_webhook_url
const OldReviewData = fs.readFileSync('./review.json', 'utf8') || ''
const Slack = require('slack-node')

const sendSlackWebHook = (data) => {
	const { overall_rating, reviews } = data
	const newestReview = reviews[0]
	const rate = Number(newestReview.star_rating)
	// const rate = 1
	const color = rate === 5 ? 'good' : rate < 4 && rate > 2 ? 'warning' : 'danger'
	const text = rate === 5 ? '>*We have just received new good review :heart_eyes:*' : rate < 4 && rate > 2 ? '>*We have just received new review :neutral_face:*' : '>*We have just received new bad review :disappointed_relieved:*'
	const slack = new Slack()
	slack.setWebhook(webhookUri)
	slack.webhook({
		channel: '#reviews',
		username: 'PageFly Reviews Bot',
		text,
		'attachments': [
			{
				'fallback': JSON.stringify(newestReview),
				color,
				'pretext': '',
				// "author_name": "PageFly Reviews Bot",
				'author_link': 'https://apps.shopify.com/pagefly',
				'author_icon': 'https://cdn.shopify.com/s/files/applications/f85ee597169457da8ee70b6652cae768_512x512.png',
				'title': newestReview.shop_name,
				'title_link': 'https://' + newestReview.shop_domain,
				'text': 'Message: ' + newestReview.body,
				'fields': [
					{
						'title': 'New Rating:',
						'value': rate + ' star'
					}
				],
				'image_url': 'http://my-website.com/path/to/image.jpg',
				'thumb_url': 'http://example.com/path/to/thumb.png',
				'footer': '<https://apps.shopify.com/pagefly#reviews|Check review>',
				'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
				'ts': Math.floor((new Date).getTime() / 1000)
			}
		]
	}, function (err, response) {
		console.log(response)
	})

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