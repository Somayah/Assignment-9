var express = require("express"),
      app = express(),
    http = require('http').Server(app),
    //Adding Socket.IO to the server 
    io = require('socket.io')(http),
    // import the mongoose library
    mongoose = require("mongoose");

    app.use(express.static(__dirname + "/client"));
    app.use(express.bodyParser());

    // connect to the amazeriffic data store in mongo
    mongoose.connect('mongodb://localhost/amazeriffic');

    // listen to port 3333
    http.listen(3333, function(){
      console.log('listening on *:3333');
    });
    // Socket.IO connection
    //---------------------
    io.on('connection', function (socket) {
       // every opening browesr will have a new connection
       console.log("a user connected");

       // Server socket reciving a newToDo object  
       socket.on('add', function (data) {
        console.log('in server socket event add  - description: '+data.description+' tag: '+data.tags);
        // sending back to every user and the sender too
        console.log("b4 broadcast emit")
        socket.broadcast.emit('broadcast add', data);
      });
      
    });

    // This is our mongoose model for todos
    var ToDoSchema = mongoose.Schema({
        description: String,
        tags: [ String ]
    });

    var ToDo = mongoose.model("ToDo", ToDoSchema);

    app.get("/todos.json", function (req, res) {
        ToDo.find({}, function (err, toDos) {
        res.json(toDos);
        });
    });

    app.post("/todos", function (req, res) {
        console.log(req.body);
        var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
        newToDo.save(function (err, result) {
            if (err !== null) {
            // the element did not get saved!
            console.log(err);
            res.send("ERROR");
            } else {
            // our client expects *all* of the todo items to be returned, so we'll do
            // an additional request to maintain compatibility
            ToDo.find({}, function (err, result) {
                if (err !== null) {
                // the element did not get saved!
                res.send("ERROR");
              }
              res.json(result);
            });
         }
    });
});

