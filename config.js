const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  port: process.env.PORT,
  url: process.env.MONGO_URL,
  db_name: process.env.MONGO_DBNAME,
  col_name: process.env.MONGO_COLNAME
};
