exports.PORT = process.env.PORT || 5000;

const DB_HOST_PORT = process.env.DB_HOST_PORT;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
exports.DB_CONNECTION_URL = `mongodb://127.0.0.1:27017/cuvette`;