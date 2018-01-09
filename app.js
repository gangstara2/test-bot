
const express = require('express'),
    app = express(),
    server = require('http').createServer(app)

const SlackWebhook = require('./slack-webhook-bot')
server.listen(process.env.PORT || 3000);

setInterval(SlackWebhook, 300000)
SlackWebhook()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

