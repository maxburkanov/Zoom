const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
let person = "";

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)    
  })

  // input value
  let text = $("#chat_message");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      const messageToSend = {        
        text: text.val(),
        user: person || "User"
      }
      socket.emit('message', messageToSend);
      text.val('')
    }
  });
  socket.on("createMessage", (message) => {
    console.log('message', message)
    $("ul").append(`<li class="message"><b style="color:grey">${message.user}</b><br/>${message.text}</li>`);
    scrollToBottom()
  })
})



socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  // person = stream.id
  // console.log('func', person)
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}




const rename = document.querySelector('#rename-name');
const copy = document.querySelector('#copy');

rename.addEventListener('change', (e) => {
  // console.log(e.target.value)
  person = e.target.value
})

copy.addEventListener('click', copyToClipboard)
function copyToClipboard(element) {
  var $temp = $("<input>");
  var $url = $(location).attr('href');
  
  $("body").append($temp);
  $temp.val($url).select();
  document.execCommand("copy");
  $temp.remove();
  element.target.style.color = "lightgrey"
  $("#copied").text("copied!");
  setTimeout(()=>{
    $("#copied").text("");
    element.target.style.removeProperty("color")
  }, 1000)

}
 



console.log(person)













