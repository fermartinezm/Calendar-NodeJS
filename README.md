# Calendar-NodeJS
Calendar with NodeJS and MongoDB

Requirements:
All appointments are 40 minutes long and have fixed times, starting from 9–9:40 am
Ensure there is always a 5 minute break in between each appointment
Appointments can only be booked during weekdays from 9 am to 6 pm
Bookings can only be made at least 24 hours in advance
Appointments cannot be booked in the past
For simplicity, use UTC time for all bookings and days

POST errors:
Invalid time slot: The time slot provided was not one of the time slots returned in the GET available time slots request
Cannot book with less than 24 hours in advance
Cannot book outside bookable timeframe: The time slot provided was not on a weekday between 9 am and 6 pm
Cannot book time in the past

All methods errors:
Where message contains the corresponding error message, such as Request is missing parameter: year
