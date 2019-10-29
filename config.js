const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  PORT: process.env.PORT,
  SCOPES_URL: process.env.SCOPES_URL,
  TOKEN_PATH: process.env.TOKEN_PATH,
  TIMEZONE: process.env.TIMEZONE,
  CALENDARID: process.env.CALENDARID
};
