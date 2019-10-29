const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {SCOPES_URL, TOKEN_PATH, TIMEZONE, CALENDARID} = require('./config');
const SCOPES = [SCOPES_URL];


module.exports =  class GogoleApi{

	constructor (){
		this.startTime = '0';
		this.endTime = '0';
	}
	readEvents(startTime, endTime, callback){
	  // Vars to get the day/s we want to know the events
	  this.startTime = startTime;
	  this.endTime = endTime;
	  // Load client secrets from a local file.
	  var action = 'read';
	  fs.readFile('credentials.json', (err, content) => {
	    if (err) return console.log('Error loading client secret file:', err);
	    // Authorize a client with credentials, then call the Google Calendar API.
	    this.authorize(JSON.parse(content), action, (err, resp) => {
	      return callback(err, resp);
	    });
	  });
	}
	
	// Function to read credentials and wait until the event is inserted
	insertEvent(startTime, endTime, callback){
		// Set startTime and endTime for the event
		this.startTime = startTime;
		this.endTime = endTime;
		var action = 'insert';
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
		  if (err) return console.log('Error loading client secret file:', err);
		    // Authorize a client with credentials, then call the Google Calendar API.
		    this.authorize(JSON.parse(content), action, (err, resp) => {
		      return callback(err, resp);
		    });
		});
	}
	
	
	
	/**
	* Create an OAuth2 client with the given credentials, and then execute the
	* given callback function.
	* @param {Object} credentials The authorization client credentials.
	* @param {function} callback The callback to call with the authorized client.
	*/
	authorize(credentials, action, callback) {
	  const {client_secret, client_id, redirect_uris} = credentials.installed;
	  const oAuth2Client = new google.auth.OAuth2(
	    client_id, client_secret, redirect_uris[0]);
	
	  // Check if we have previously stored a token.
	  fs.readFile(TOKEN_PATH, (err, token) => {
	    if (err) return this.getAccessToken(oAuth2Client, callback);
	    oAuth2Client.setCredentials(JSON.parse(token));
	    if (action === 'read'){
	      this.listEvents(oAuth2Client, this.startTime, this.endTime,
	    	(err, resp) => {
	    	return callback(err, resp);
		  });
	    }
	    else if(action === 'insert'){
	      this.createEvents(oAuth2Client, this.startTime, this.endTime,
	    	(err, resp) => {
		    return callback(err, resp);
		  });
	    }
	  });
	}
	
	/**
	* Get and store new token after prompting for user authorization, and then
	* execute the given callback with the authorized OAuth2 client.
	* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	* @param {getEventsCallback} callback The callback for the authorized client.
	*/
	getAccessToken(oAuth2Client, callback) {
	  const authUrl = oAuth2Client.generateAuthUrl({
	    access_type: 'offline',
	    scope: SCOPES,
	  });
	  console.log('Authorize this app by visiting this url:', authUrl);
	  const rl = readline.createInterface({
	    input: process.stdin,
	    output: process.stdout,
	  });
	  rl.question('Enter the code from that page here: ', (code) => {
	    rl.close();
	    oAuth2Client.getToken(code, (err, token) => {
	      if (err) return console.error('Error retrieving access token', err);
	      oAuth2Client.setCredentials(token);
	      // Store the token to disk for later program executions
	      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
	      if (err) return console.error(err);
	        console.log('Token stored to', TOKEN_PATH);
	      });
	      callback(oAuth2Client);
	    });
	  });
	}
	
	/**
	 * Lists the next 10 events on the user's primary calendar.
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
	 */
	listEvents(auth, startTime, endTime, callback) {
	  var events_list = [];
	  const calendar = google.calendar({version: 'v3', auth});
	  calendar.events.list({
	    calendarId: 'primary',
	    timeMin: startTime,
	    timeMax: endTime,
	    maxResults: 400,
	    singleEvents: true,
	    orderBy: 'startTime',
	  }, (err, res) => {
	    if (err) return console.log('The API returned an error: ' + err);
	    const events = res.data.items;
	    if (events.length) {
	      events.map((event, i) => {
	        //const start = event.start.dateTime || event.start.date;
	        events_list.push(event.start.dateTime);
	      });
	    } else {
	      console.log('No upcoming events found.');
	    }
	    return callback('Error', events_list);
	  });
	}
	
	// Function to insert the event in Google Calendar
	createEvents(auth, startTime, endTime, callback){
		const calendar = google.calendar({version: 'v3', auth});
		calendar.events.insert({
			auth: auth,
		  	calendarId: CALENDARID,
		  	resource: {
		  		'start': {
		  			'dateTime': startTime,
				    'timeZone': TIMEZONE,
				},
				'end': {
				    'dateTime': endTime,
				    'timeZone': TIMEZONE,
				},
		  	}
		}, function(err, event) {
			if (err) {
				console.log('There was an error contacting the Calendar service: ' + err);
				return;
			}
			// Vars
			var sTime = startTime;
			var eTime = endTime;
			console.log('Event created: %s', event.data.htmlLink);
			return callback('Error', event.data.htmlLink);
		});
	}
}
