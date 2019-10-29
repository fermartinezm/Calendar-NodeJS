module.exports =  class CheckDate{
	
	validate_time(year, month, day = '01', hour = '09', minute='00'){
		try{
			// Get book date, book time, book week day
			var book_date = new Date(year + '-' + month + '-' + day + 'T' +
					hour + ':' + minute + ':00.000Z');
			var book_time = hour + minute;
			var book_weekday = book_date.getDay();
			
			// Get current time and 24h later
			var now = new Date();
			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			// return var, it has starTime and Endtime
			var ret = false;
			// var to compare valid slots
			var timeSlots = ['0900', '0945', '1030', '1115', '1200', '1245',
				'1330', '1415', '1500', '1545', '1630', '1715'];

			// Check if book in the past
			if (now > book_date) {
				ret = 1;
			}
			
			// Check book with at least 24h
			else if(tomorrow > book_date){
				ret = 2;
			}
			
			// Check book time is between 9.00 and 18.00
			// and is not weekend (Sat = 6 and Sun = 0)
			else if (Number(book_time) < 900 || Number(book_time) > 1800 
					|| book_weekday === 0 || book_weekday === 6) {
		    	ret = 3;
		    }
			
			// Check if is the book time is not a valid slot
			else if (timeSlots.indexOf(book_time) === -1){
				ret = 4;
			}
			
			// If the book time is valid, calculate the finish time
			else if(timeSlots.indexOf(book_time) > -1){
				//var endTime = new Date(book_date);
				//endTime.setMinutes(endTime.getMinutes() + 40);
		        ret = true;
			}
			
		}
		catch(error){
			throw error;
		}
		return ret;
	}
	
	// Method to take start time and end time
	// for a whole month and check if is the past
	days_month(year, month, day = '01', hour = '00', minute='00'){
		try{
			// Return var
			var ret = [];
			// Var to check if is the past
			var now = new Date ()
			now = Number(String(now.getFullYear()) + 
					String(now.getMonth() + 1));
			// Check if is the past
			if (now <= Number(year + month)){
				var startTime = new Date(year + '-' + month + '-' +
						day + 'T' + hour + ':' + minute + ':00.000Z');
				var endTime = new Date(startTime)
				// Increment one month and remove one day
				// to take the last day of the month
				endTime.setMonth(endTime.getMonth() + 1);
				endTime.setDate(endTime.getDate() - 1);
				ret = [startTime, endTime];
			}
			else{
				ret = ['No time slots availables for last month', 0]
			}
		}
		catch(error){
			throw error;
		}
		return ret;
	}
	
	// Method to know the days with availables slots
	days_available(year, month, events_list){
		try{
			// Return var
			var ret = [];
			// Get all possible slots in the month
			// and the total days of the month
			var [slots, total_days] = this.get_all_slots(year, month);
			// Change format return var
			// to the one required
			for (var h=0; h < total_days; h++){
				ret[h] = {'day': ("0" + (h + 1)).slice(-2), "hasTimeSlots": false}
			}
			// Remove slots already booked
			events_list.forEach(function(event){
				slots = slots.filter(e => e !== event);
			});
			// Check if there is days with free spots
			for (var i=0; i < slots.length; i++){
				// Extract the day from the remaining slots
				var day = slots[i].split('T')[0].split('-')[2];
				// Change to true the days with available slots
				ret[day -1] = {'day': day, "hasTimeSlots": true}
			}
		}
		catch(error){
			throw error;
		}
		return ret;
	}

	// Method to get all possible slots in one month
	get_all_slots(year, month){
		try{
			// Return var
			var ret = [];
			// Get total days of the month
			var total_days = new Date(year, month, 0).getDate();
			// Array with all possible slots
			var all_slots = [];
			for (var i=0; i < total_days; i++){
				// Var to get the day as string type
				var aux = ("0" + (i + 1)).slice(-2)
				all_slots.push(year + '-' + month + '-' + aux + 'T09:00:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T09:45:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T10:30:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T11:15:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T12:00:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T12:45:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T13:30:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T14:15:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T15:00:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T15:45:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T16:30:00Z');
				all_slots.push(year + '-' + month + '-' + aux + 'T17:15:00Z');
			}
			ret = [all_slots, total_days];
		}
		catch(error){
			throw error;
		}
		return ret;
	}
	
	// Method to know the timeSlots available
	timeslots_available(events_list){
		try{
			// Return var
			var ret = [];
			// Var to get the date
			var date = (events_list[0]).split('T')[0];
			// Var with all possible time slots
			var timeSlots = [date + 'T09:00:00.000Z', 
				date + 'T09:45:00.000Z',
				date + 'T10:30:00.000Z',
				date + 'T11:15:00.000Z',
				date + 'T12:00:00.000Z',
				date + 'T12:45:00.000Z',
				date + 'T13:30:00.000Z',
				date + 'T14:15:00.000Z',
				date + 'T15:00:00.000Z',
				date + 'T15:45:00.000Z',
				date + 'T16:30:00.000Z',
				date + 'T17:15:00.000Z'
				];
			events_list.forEach(function(event){
				// Modify the Google Calendar output's format
				// to ISO 8601
				event = event.split('Z')[0] + '.000Z';
				// Remove event from the var timeSlots
				timeSlots = timeSlots.filter(e => e !== event);
			});
			// Calculate the end time for timeslots available
			// and change to output format
			timeSlots.forEach(function(time){
				var endTime = new Date(time);
				endTime.setMinutes(endTime.getMinutes() + 40);
				ret.push({'startTime': time, 'endTime': endTime});
			})
		}
		catch(error){
			throw error;
		}
		return ret;
	}
	
	
	// Method to get start time and end time
	// for the book rest method
	book_times(year, month, day, hour, minute){
		try{
			// Return var
			var ret = [];
			// Get start time
			var startTime = new Date(year + '-' + month + '-' + day + 'T' +
					hour + ':' + minute + ':00.000Z');
			// Get end time
			var endTime = new Date(startTime);
			endTime.setMinutes(endTime.getMinutes() + 40);
			ret = [startTime, endTime];
		}
		catch(error){
			throw error;
		}
		return ret;
	}
}

