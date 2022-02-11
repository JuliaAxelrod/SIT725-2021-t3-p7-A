let express = require("express");
let app = express();

//var app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let dbo = require('./db/conn');

// Check for image - Path exists
const fs = require("fs");

const path = "public/index.html";

if (fs.existsSync(path)) {
  // path exists
  console.log("exists:", path);
} else {
  console.log("DOES NOT exist:", path);
}

const pathErr = "./file.txt";

fs.access(pathErr, fs.F_OK, (err) => {
  if (err) {
    console.error(err)
    return
  };
});

var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(express.json());

console.log (process.env.name);
app.get("/test", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});


//socket test
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  setInterval(()=>{
    socket.emit('number', parseInt(Math.random()*10));
  }, 1000);

});

const projects = [];

for (let id = 1; id < 21; id++){

  let projectDate = new Date(id*100000000000);
  let projectImage = "assets/" + id.toString() + ".jpg"
  console.log ("projectImage", projectImage);

  projects.push({
    projectID: id,
    projectDate: projectDate,
    title: 'project ' + id,
    info: `This is the info the project number ${id} logged on the ...${projectDate.getFullYear()}   ${projectDate.getDay()}  ${projectDate.getMonth()}`,
    // img: "assets/" + id.toString() + ".jpg", 
    // img: null, 
    img: fs.existsSync(projectImage) ? projectImage : "assets/Iceberg_7292.jpg",
  });
  console.log ("project Date ",  typeof(projectDate), projectDate.getFullYear(), ); 
}


app.get("/project", function (request, response) {
  console.log(request.query.id);
  dbo.getDB()
      .collection("projects")
      .find({projectID:request.query.id})
      .toArray((err, res) => {
          if (err) {
              throw err;
          }
          response.send(res);
      })
});


app.get("/projects", function (request, response){
  dbo.getDB()
    .collection ("projects")
    .find({})
    .toArray((err,res) => {
      if (err){
        throw err;
      }
      response.send(res);
    })

  // response.json(projects);
  // Fixed syntax - both filter queries work !!!
  // console.log ("hello ", Date.now(), "Byebye", new Date(1985, 0, 0, 0, 0, 0));
  // response.json(projects.filter(p=>(p.projectDate <= Date.now() &&  p.projectDate > new Date(1985, 0, 0, 0, 0, 0))));
  //  // response.json(projects.filter(p=>p.projectDate <= Date.now()));
});


// Send date as     "projectDate": "2015-03-12T13:37:27+00:00",
app.post("/project", function(request, response){
  // add proper validation
  if (!request.body) 
    response.sendStatus (500);

                                  // else {  projects.push(request.body);
                                  //   response.sendStatus(204);}
  dbo.getDB()
      .collection("projects")
      .insertOne(request.body); // projects.push(request.body);
      console.log(request.body)
      response.sendStatus(200);  // SEND THE RESPONSE!!!!!
  });

//Connect to DB, if error - terminate, nothing else to do.
dbo.connect ((err) => {
  if (err) {
    console.error(err);
    process.exit();
  }
  // If success - listen on port from env variables
  http.listen(port,()=>{
    console.log("Listening on port ", port);
  });
});

//this is only needed for Cloud foundry 
require("cf-deployment-tracker-client").track();
