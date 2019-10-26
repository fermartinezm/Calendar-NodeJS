module.exports =  class ManageData{
	
	// Function to manage the data needed to do an appointment
	timeslot_data(year, month, day, hour, minute){
	    // Book date and book day week
	    var book_hour = ("0" + hour).slice(-2);
	    var book_minute = ("0" + minute).slice(-2);
	    var book_time = parseFloat(book_hour + '.' + book_minute);
	    var book_aux = new Date(year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':00.000Z');
	    var book_date = book_aux.getTime();
	    var book_weekday = book_aux.getDay();
	
	    // Current date
	    var date = new Date();
	    var curr_date = date.getTime();
	    
	    // Tomorrow date
	    var tomorrow = date.setDate(date.getDate() + 1);
	    return [book_time, book_weekday, book_date, curr_date, tomorrow, book_aux]
	}

	
	// Function to check all the conditions to make an appointment
  	timeslot_validate(year, month, day, hour, minute) {
  		var valid_time = [9, 9.45, 10.30, 11.15, 12, 12.45, 13.30, 14.15, 15, 15.45, 16.30, 17.15];
  		var [book_time, book_weekday, book_date, curr_date, tomorrow, book_aux] = this.timeslot_data(year, month, day, hour, minute);
  		var res = false;
  		
	    // Check book time is between 9.00 and 18.00
	    if (book_time < 9.00 || book_time > 18.00 || book_weekday === 0 || book_weekday === 6) {
	    	res = ['Cannot book outside bookable timeframe', 0];
	    }
		    
	    // Check book time is valid
  		
	    else if (valid_time.includes(book_time) === false) {
	    	res = ['Invalid time slot', 0];
	    }
	    
	    // Check book in the past
	    else if (curr_date > book_date) {
	    	res = ['Cannot book time in the past', 0];
	    }
	    
	    // Check book with at least 24h
	    else if (tomorrow > book_date) {
	    	res = ['Cannot book with less than 24 hours in advance', 0];
	    }
	    
	    // Book time is correct
	    else if(valid_time.includes(book_time) === true) {
	        var finish_time = new Date(book_aux);
	        finish_time.setMinutes(book_aux.getMinutes() + 40);
	        res = [book_aux, finish_time];
	    }
	    
	    // Manage any unexpected situation
	    else{
	      res = ['Error', 0];
	    }
	    return res;
  	}


  	// Function to know the time slots availables
	timeslots_availables(object){
		
		// Posible time slots
		var timeslots = [9, 9.45, 10.30, 11.15, 12, 12.45, 13.30, 14.15, 15, 15.45, 16.30, 17.15];
		object.forEach(function(item){
			
			// Get booked timeslots and change format
			var aux = JSON.stringify(item['start_time']).split('T')[1].split(':');
			var time = parseFloat(aux[0] + '.' + aux[1]);
			
			// Remove the timeslots already booked from the var timeslots
			timeslots.splice(timeslots.indexOf(time), 1);
		})
		return timeslots;
	}
	
	// Function to prepare the output for timeslots
	timeslots_lists(year, month, day, object){
		
		// Get all available timeslots
		var timeslots_list = [];
		var timeslots_avail = this.timeslots_availables(object);
		
		// Change format and get start and finish time of the timeslot
		timeslots_avail.forEach(function(item){
			var aux = String(item) + ".00";
			var hour = ("0" + aux.split('.')[0]).slice(-2);
			var minute = (aux.split('.')[1] + "0").slice(0,2);
		    var start_time = new Date(year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':00.000Z');
		    var finish_time = new Date(start_time);
	        finish_time.setMinutes(start_time.getMinutes() + 40);
	        
	        // Prepare output
	        var dict = {"start_time": start_time, "end_time": finish_time}
	        timeslots_list.push(dict);
		})
	    return timeslots_list;
	}
	
	days_availables(year, month, object){
		// Get total days of the month
		var total_days = new Date(year, month, 0).getDate();
		
		// Declare output
		var result = [];
		for (var i=0; i < total_days; i++){
			result.push({'day': i+1, 'hasTimeSlots': true})
		}
		
		// Declare vars to get days without slots
		var day_list = [];
		var dict = {};
		var compare = ['0900', '0945', '1030', '1115', '1200', '1245', '1330', '1415', '1500', '1545', '1630', '1715'];
		
		// Create dict with format {day: [time1, time2, ... ]}
		// Relation between day of the month and time slots already booked
		object.forEach(function(item, i){
			var day = JSON.stringify(item['day']).replace('"', '').replace('"', '');
			var time = JSON.stringify(item['start_time']).split('T')[1].split(':', 2).join('');
			day_list.push({'day': day, 'time': time});
			if (day_list[i]['day'] in dict){
				dict[day_list[i]['day']].push(day_list[i]['time']);
			}else{
				dict[day_list[i]['day']] = [day_list[i]['time']]
			}
		});
		
		// Compare day's appointments with the array with all timeslots
		for(var key in dict){
			if (dict[key].length == compare.length && dict[key].every((v) => compare.indexOf(v) >= 0)){
				result[key-1] = {'day': Number(key), 'hasTimeSlots': false}
			}
		}
		return result;
	}
}
