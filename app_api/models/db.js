var mongoose = require('mongoose');
var dbURI ="mongodb+srv://gorkemarpaci19:5aVR1kd8cLjtrjTEE@gorko.7nd3b.mongodb.net/"
//var dbURI = "mongodb://localhost:/mekanbul"
mongoose.connect(dbURI)
mongoose.connection.on("connected", function(){
    console.log("Mongoose connected to " + dbURI)
})

mongoose.connection.on("disconnected", function(err){
    console.log("kapandı")
})

process.on("SIGINT", function(){
    mongoose.connection.close()
    console.log("MongoDB bağlantısı kesildi, uygulama durduruldu.")
    process.exit(0)
})

require("./venue.js")
