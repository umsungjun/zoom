const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to server ✅");

  setTimeout(() => {
    socket.send("Hello!! from browser");
  }, 10000);
});

socket.addEventListener("message", (message) => {
  console.log("Message from server: ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from server ❌");
});
