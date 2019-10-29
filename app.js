const express = require('express');
const querystring = require('querystring');

const check_date = require('./check_date.js');
const google_api = require('./google_api.js');
const {PORT} = require('./config');

const app = express();
const val_date = new check_date();
const google = new google_api();

const book_errors ={1: 'Cannot book time in the past',
						2: 'Cannot book with less than 24 hours in advance',
						3: 'Cannot book outside bookable timeframe',
						4: 'Invalid time slot'}

const timeslots_errors ={1: 'No time slots available for day in the past',
			3: 'No time slots available outside bookable timeframe'
			}

app.get('/days', (req, res) => {
	try{
		var month = req.query.month;
	  	var year = req.query.year;
		// Get start and end time for the month
		var [startTime, endTime] = val_date.days_month(
				year, month)
		// Check if the time request is in the past
		if (typeof startTime == 'string'){
			// If the book time is in the past
			// respond with code 400 and the message
			res.status(400).send({
				  "success": false,
				  "message": startTime
			});
		}
		// If the time request is not in the past
		else{
			// Read events from Google Calendar
			// Callback function to wait until Google Calendar 
			// gives a response
			google.readEvents(startTime, endTime, (err, events_list) => {
				// Send response telling which days have slots available
				res.status(200).send({
			  	  "success": true,
			  	  "timeSlots": val_date.days_available(year, month, events_list)
				});
			});
		}
	}
	catch(error){
		console.log(error)
	}
});


// Rest method to know what slots are free
app.get('/timeslots', (req, res) => {
	try{
		// Get arguments from query
		var day = req.query.day;
		var month = req.query.month;
		var year = req.query.year;
		// Check if the timeslot date is valid
		var check = val_date.validate_time(
				year, month, day)
		
		// If the timeslot is valid...
		if (check === true){
			// Get start and end time
			// Time appointments start
			var startTime = new Date(year + '-' + month + '-' + day
					+ 'T' + '09:00:00.000Z');
			// Time appointments finish
			var endTime = new Date(year + '-' + month + '-' + day
					+ 'T' + '18:00:00.000Z');
			// Read events from Google Calendar
			// Callback function to wait until Google Calendar 
			// gives a response
			google.readEvents(startTime, endTime, (err, events_list) => {
				// Get time slots available for the day
				var timeSlots = val_date.timeslots_available(events_list);
				// If there are not time slots available
				if (timeSlots.length == 0){
					res.status(200).send({
					  	  "success": true,
					  	  "timeSlots": 'There are not time slots availables'
					});
				}
				// If there are time slots available
				// response with them
				else{
					res.status(200).send({
					  	  "success": true,
					  	  "timeSlots": timeSlots
					});
				}
			});
		}
		else{
			// If the book time is not valid
			// respond with code 400 and the error
			res.status(400).send({
				  "success": false,
				  "message": timeslots_errors[check]
			  });
		}
	}
	catch(error){
		console.log(error)
	}
});


// Rest method to insert events
app.post('/book', (req, res) => {
	try{
		// Get arguments from query
		var minute = req.query.minute;
		var hour = req.query.hour;
		var day = req.query.day;
		var month = req.query.month;
		var year = req.query.year;
		
		// Check if book time is valid
		var check = val_date.validate_time(
				year, month, day, hour, minute)

		// If the book time is valid...
		if (check === true){
			// Get start and end time of the booking slot
			var [startTime, endTime] = val_date.book_times(
					year, month, day, hour, minute);
			// Insert event. Callback function to make 
			// sure Google Calendar inserted the new book
			google.insertEvent(startTime, endTime, (err, resp) => {
				res.status(200).send({
			  	  "success": true,
			  	  "startTime": startTime,
			  	  "endTime": endTime
				});
			});
		}
		
		// If the book time is not valid
		// respond with code 400 and the error
		else{
			res.status(400).send({
				  "success": false,
				  "message": book_errors[check]
			  });
		}
	}
	catch(error){
		console.log(error);
	}
});


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});