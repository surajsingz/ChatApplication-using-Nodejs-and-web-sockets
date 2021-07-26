const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userHeader = document.getElementById('displayUser');

const socket  = io();

//Get username and room info
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

//Join Chatroom
socket.emit('joinRoom',{username, room});

//Get room and users
socket.on('roomUsers',({room, users}) =>{
    outputRoomName(room);
    outputUsers(users);
})

//Message from server
socket.on('message', message=>{
    console.log(message);
    outputMessage(message);

    //scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message Submit from chat.html
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //Get message Text
    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    //clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output Message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
 

//Add room name to DOM
 function outputRoomName(room){
     roomName.innerText = room;
 }

 //Add users to DOM
 function outputUsers(users){
     userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
     `;
 }