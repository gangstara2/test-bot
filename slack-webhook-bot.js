const https = require('https')
const fs = require('fs')
const webhookUri = require('./config').slack_webhook_url
const Slack = require('slack-node')

const sendSlackWebHook = (data) => {
	const { overall_rating, reviews } = data
	console.log(reviews.length)
	const newestReview = reviews[0]
	const rate = Number(newestReview.star_rating)
	const color = rate === 5 ? 'good' : rate < 5 && rate > 3 ? 'warning' : 'danger'
	const text = rate === 5 ? '>*We have just received new good review :heart_eyes:*' : rate < 5 && rate > 3 ? '>*We have just received new review :neutral_face:*' : '>*We have just received new bad review :disappointed_relieved:*'
	let star = '', i = 0
	while (i < 5) {
		if (i < rate) {
			star += '★'
		} else {
			star += '☆'
		}
		i++
	}
	const slack = new Slack()
	slack.setWebhook(webhookUri)
	slack.webhook({
		channel: '#reviews',
		username: 'PageFly Reviews',
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
				// 'text': '*Message:* ' + newestReview.body,
				'fields': [
					{
						'title': star,
						value: newestReview.body
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
let count = 0
const SlackWebHook = () => {
	try {
		const OldReviewData = fs.readFileSync('./review.json', 'utf8') || ''
		console.log(new Date(), ':: collecting PageFly reviews data... :: count:', count)
		count++
		https.get('https://apps.shopify.com/pagefly/reviews.json', (resp) => {
			let data = ''
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk
			})

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				const newReviewData = JSON.parse(data)
				const oldData = JSON.parse(OldReviewData)
				console.log(newReviewData.reviews.length , oldData.reviews.length)
				if (newReviewData.reviews && oldData.reviews && newReviewData.reviews.length !== oldData.reviews.length) {
					console.log('sending slack webhook')
					fs.writeFile('./review.json', data, () => {
						sendSlackWebHook(newReviewData)
					})
				} else {
					console.log('no update about reviews on PageFly!')
				}
			})

		}).on('error', (err) => {
			console.log('Error: ' + err.message)
		})
	} catch (e) {
		console.log(e)
	}
}

module.exports = SlackWebHook