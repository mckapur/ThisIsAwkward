var http = require('http');
var express = require('express');
var hbs = require('hbs');
var twilio = require('twilio')
var twilioClient = twilio('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

var app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.bodyParser());
app.use(express.static('views'));
app.use(app.router);

app.listen(3001);

var message;
var name = "Anonymous";
var phoneNumber;

app.post('/go', function(req, res) {

	var status = "We fired your call!";

	if (req.body.callMessageToRecipient) {

		message = req.body.callMessageToRecipient;
	}

	if (req.body.callSenderName) {

		name = req.body.callSenderName;
	}

	if (req.body.callRecipientPhoneNumber) {

		phoneNumber = req.body.callRecipientPhoneNumber;
	}

	if (message && phoneNumber) {

		twilioClient.makeCall ({

			to: phoneNumber,
			from: 'YOUR_TWILIO_PHONE_NUMBER',
			url: 'YOUR_TWIML_URL'
		},
		function(err, responseData) {

		    if (err) {

		    	status = err;

		    	updateStatusWithResponse(1, status, res);
		    }
		    else {

		    	updateStatusWithResponse(0, status, res);
		    }
		});
	}
	else {

		status = "Please fill in all fields!";

		updateStatusWithResponse(1, status, res);
	}
});

app.post('/YOUR_DESIRED_TWIML_DIR', function(req, res) {

	var twiml = new twilio.TwimlResponse();

    twiml.say("The following message has been sent from: " + name);
    twiml.pause({length: 1.5});		        
    twiml.say(message);
    twiml.pause({length: 3});	
    twiml.hangup();

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

function updateStatusWithResponse(isError, customStatus, res) {

	var err = '';

	if (isError == 1) {

		err = 'Could not make call: '
	}

	res.render('index', {

		response: {

			status: err + customStatus
		}
	});
}

app.get('/', function(req, res) {

	res.render('index', {

	});
});