const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`나: ${value}`);
  });
  input.value = "";
};

const handleNicknameSubmit = () => {
  const input = welcome.querySelector("#name");
  const value = input.value;
  socket.emit("nickname", value);
  input.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;

  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
};

const handleSubmit = (event) => {
  event.preventDefault();
  handleNicknameSubmit(); // 닉네임 설정
  const input = form.querySelector("#roomName");
  roomName = input.value;
  socket.emit("enter_room", input.value, showRoom); // 마지막 인자는 클라이언트에서 실행 될 함수
  input.value = "";
};

form.addEventListener("submit", handleSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user}님이 참여했습니다.`);
});

socket.on("bye", (user) => {
  addMessage(`${user}님이 나갔습니다.`);
});

socket.on("new_message", addMessage);
