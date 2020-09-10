const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/EntertainmentBD', { useMongoClient: true})
mongoose.Promise = global.Promise;

module.exports = mongoose