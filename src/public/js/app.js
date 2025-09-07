const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    /* 카메라 선택 Select 옵션 추가 */
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0].label;
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
};

const getMedia = async (deviceId) => {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.error(error);
  }
};

/* 마이크 on/off */
const handleMuteClick = () => {
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
};
/* 카메라 on/off */
const handleCameraClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
};

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

/* 카메라 변경 */
const handleCameraChange = async () => {
  await getMedia(camerasSelect.value);
};
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
};

/* Welcome Form (방 입장) */
const handleWelcomeSubmit = async (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  const value = input.value;
  await initCall();
  socket.emit("join_room", value);
  roomName = value;
  input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// socket code
// Peer A
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("1. sent the offer");
  socket.emit("offer", offer, roomName);
});
socket.on("answer", (answer) => {
  console.log("4. received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

// Peer B
socket.on("offer", async (offer) => {
  console.log("2. received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  console.log("3. sent the answer");
  socket.emit("answer", answer, roomName);
});

// Both Peers
socket.on("ice", (ice) => {
  console.log("6. received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC code
const handleIce = (data) => {
  console.log("5. sent candidate");
  socket.emit("ice", data.candidate, roomName);
};

const handleAddStream = (data) => {
  console.log("Peer's Stream", data.stream);
  console.log("My Stream", myStream);
  const peersStream = document.getElementById("peerFace");
  peersStream.srcObject = data.stream;
};

const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};
