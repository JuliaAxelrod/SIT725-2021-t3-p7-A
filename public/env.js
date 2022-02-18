const testButtonFunction=()=>{
  alert('Thank you for clicking')
}

// connect to the socket

let socket = io();

// socket.io to update - add project and refresh all browsers
socket.on('project:update', (project) => {
  $('#projects-list').append(projectCard(project));
})

// socket.io to delete by id  -  and refresh all browsers
socket.on('project:delete', (id) => {
  $(`#project-id-${id}`).remove(); 
})


// socket.io to broadcast the chat message  -  and refresh all browsers
socket.on('chat:broadcast', (message) => {
  $("#chat-message-list").append(createMessage(message, true));
})

function projectCard(project) {
  return `    <div class="col s6 m4 l3 "  id="project-id-${project.projectID}" >
  <div class="card"> 
    <div class="card-image">

      <img src="${project.img ? project.img : 'assets/Iceberg_7292.jpg'}">

      <span class="card-title">${project.title} ${project.projectDate}</span>
    </div>
    <div class="card-content">
      <p>${project.info}</p>
    </div>
    <div class="card-action">
      
      <a class="waves-effect waves-light indigo lighten-1 btn href="project.html?pid=${project.projectID}">Open</a>
      <a class="waves-effect waves-light cyan lighten-1 btn" onClick="deleteProject(${project.projectID})"><i class="material-icons right">delete</i></a>
    </div>
  </div>
</div>`
}
      

function deleteProject(id) {
var settings = {
  "url": `/api/projects/${id}`,
  "method": "DELETE",
  "timeout": 0,
};

$.ajax(settings).done(function (response) {
  // $(`#project-id-${id}`).remove();  //moved to socket.io
});
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function createProject(){ 
  let img = document.querySelector('#project-file').files[0];
  if (img){
    getBase64(img).then(
      d => {
        const project = {
          "projectID": $('#project-id').val(), // 212,
          "projectDate": $('#project-date').val(), // "2017-03-12T13:37:27+00:00",
          "title": $('#project-title').val(), // "project 212",
          "info": $('#project-info').val(), // "Cierva Cove, Antarctica ",
          "img": d   // $('#project-image').val() // null
        };
      
        var settings = {
          "url": "/api/projects",
          "method": "POST",
          "timeout": 0,
          "headers": {
            "Content-Type": "application/json"
          },
          "data": JSON.stringify(project),
        };

        console.log(settings);
        $.ajax(settings).done(function (response) {
            // debugger;
          console.log('Cheers!!');
            // $('#projects-list').append(projectCard(project)); //moved to socket.io
      
            $('#project-id').val(''); 
            $('#project-date').val(''); 
            $('#project-title').val(''); 
            $('#project-info').val(''); 
            $('#project-image').val(''); 
            $('.modal').modal('close');
         
      
            console.log(response);
      
        });
      })
  }
  // debugger;

  console.log('Cheers!!!');
};

function createMessage(msg, isRight = false) {
  return `<p class="${isRight ? 'msg-right' : 'msg-left'}">
    ${msg}
  </p><br style="clear:both"/>`
  console.log(isRight);
}



console.log('test')
$(document).ready(function(){
  console.log('Ready')
  $('.sidenav').sidenav();
  $('.modal').modal();
  $('#insert-project').click(() => {
    createProject();
  });

  //bind the button
  // $('#testButton').click(testButtonFunction)

  //test get call
  $.get('/test?user_name="Fantastic User"',(result)=>{
    console.log(result)
  });

  $("#chat-send-message-btn").click(() => {
      // send message to the server
      socket.emit("chat:message", $("#chat-message").val());
      // add the  this meeage to the msg list 
      $("#chat-message-list").append(createMessage($("#chat-message").val()));
      // clear the message val
      $("#chat-message").val("");
  });


  // $.get('/projects', (result) => {
  //   $('#projects-list').text(JSON.stringify(result))
  //   console.log(result)
  // })

  $.get('/api/projects', (result) => {
    for (let p of result) {
    $('#projects-list').append(projectCard(p))
    }
    console.log(result)
  })
})
