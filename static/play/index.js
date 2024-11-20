const socket = io("/room");

socket.on("players update", (e) => {
  console.log(e);
});

socket.on("info", console.log);

socket.emit("request room access", { id: "tititoi", playerPseudo: "Kylian" });
