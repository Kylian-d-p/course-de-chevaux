const searchParams = new URLSearchParams(window.location.search);

if (typeof searchParams.get("id") !== "string") {
  fetch("/api/room/create", { method: "POST" }).then((res) => {
    res.json().then((data) => {
      document.location.replace(`${document.location.pathname}${document.location.search}&id=${data.data.gameId}`);
    });
  });
} else {
  const socket = io();

  socket.emit("request room access", {
    id: searchParams.get("id"),
    playerPseudo: searchParams.get("pseudo"),
  });
  
  socket.on("players update", (players) => {
    for (let i = 0; i < players.length; i++) {
      document.querySelectorAll(".horse")[i].style.left = `${players[i].progress}`;
    }
  });

  socket.on("info", console.log);

  document.addEventListener("keydown", () => {
    socket.emit("add progress", {playerPseudo: searchParams.get("pseudo")})
  })
}
