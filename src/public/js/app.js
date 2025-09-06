const socket = new WebSocket(`ws://${window.location.host}`);

const handleOpen = () => {
  console.log("Connected to server ✅");
};

const handleClose = () => {
  console.log("Disconnected from server ❌");
};

const handleMessage = (message) => {
  console.log("Message from server: ", message.data);
};

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", handleMessage);

socket.addEventListener("close", handleClose);
