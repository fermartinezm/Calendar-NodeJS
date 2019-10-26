const express = require('express');
const querystring = require('querystring');
const mongo = require('mongodb').MongoClient;

const manage_data = require('./manage_data.js');
const {port, url, db_name, col_name} = require('./config');


const app = express();

// Create manage data object
const man_data = new manage_data();



app.get('/days', (req, res) => {
	try{
		if (req.query.hasOwnProperty('year') !== true || req.query.hasOwnProperty('month') !== true){
			throw new Error('Insert correct command')
		}
		var month = req.query.month;
	  	var year = req.query.year;
	  	mongo.connect(url, function(err, db) {
			if (err) throw err;
			var query = {"year": year, "month": month}
			var dbo = db.db(db_name);
			dbo.collection(col_name).find(query).toArray(function(err, object){
				if (err) throw err;
			    db.close();
			    res.status(200).send({
			    	"success": true,
			    	"days": man_data.days_availables(year, month, object)
			    });
			});
		});
	}
	catch(error){
		res.status(400).send({
	    	"success": false,
	    	"Error": error.message
		});
	}
});


app.get('/timeslots', (req, res) => {
	if (req.query.hasOwnProperty('year') !== true || req.query.hasOwnProperty('month') !== true || req.query.hasOwnProperty('day')){
		throw new Error('Insert correct command')
	}
	try{
		var day = req.query.day;
		var month = req.query.month;
		var year = req.query.year;
		
		// Read data from Database
		mongo.connect(url, function(err, db) {
			if (err) throw err;
			var query = {"year": year, "month": month, "day": day}
			var dbo = db.db(db_name);
			dbo.collection(col_name).find(query).toArray(function(err, object){
				if (err) throw err;
			    db.close();
			    
			    // Rest response and get free timeslots
			    res.status(200).send({
			    	"success": true,
			    	"timeSlots": man_data.timeslots_lists(year, month, day, object)
			    });
			});
		});
	}
	catch(error){
		res.status(400).send({
	    	"success": false,
	    	"Error": error.message
	    });
	}
});


app.post('/book', (req, res) => {
	try{
		if (req.query.hasOwnProperty('year') !== true || req.query.hasOwnProperty('month') !== true || req.query.hasOwnProperty('day') || req.query.hasOwnProperty('hour') || req.query.hasOwnProperty('minute')){
			throw new Error('Insert correct command')
		}
		// Get arguments
		var minute = req.query.minute;
		var hour = req.query.hour;
		var day = req.query.day;
		var month = req.query.month;
		var year = req.query.year;
	  
		// Check if book time is valid
		var [start_time, finish_time] = man_data.timeslot_validate(year, month, day, hour, minute);
		
		// If the book time is valid
		if (typeof start_time === 'object'){
			// Insert data in DB
			mongo.connect(url, function(err, db) {
				if (err) throw err;
				var data = {"year": year,
				                     "month": month,
						  			 "day": day,
						  			 "start_time": start_time,
						  			 "finish_time": finish_time
						  			 }
				var dbo = db.db(db_name);
				dbo.collection(col_name).insertOne(data, function(err, res) {
					if (err) throw err;
					console.log("Data inserted");
					db.close();
				});
			});
			
			// Rest response
			res.status(200).send({
		    	  "success": true,
		    	  "startTime": start_time,
		    	  "endTime": finish_time
			});
			
	  // If the book time is not valid
	  } else {
		  res.status(400).send({
			  "success": false,
			  "message": start_time
		  });
	  	}
	}
	catch(error){
		res.status(400).send({
	    	"success": false,
	    	"Error": error.message
		});
	}
});

// Launch REST
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
