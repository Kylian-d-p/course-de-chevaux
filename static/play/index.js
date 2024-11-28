const searchParams = new URLSearchParams(window.location.search);

const gameId = searchParams.get("id");

if (typeof gameId !== "string") {
  fetch("/api/room/create", { method: "POST" }).then((res) => {
    res.json().then((data) => {
      if (!res.ok) {
        data.message && alert(data.message);
        return document.location.replace(`/login/index.html?redirectTo=${encodeURIComponent(window.location.href)}`);
      }
      document.location.replace(`${document.location.pathname}?id=${data.data.gameId}`);
    });
  });
} else {
  const socket = io();
  let gameStatus = "stopped";

  socket.emit("request room play access", {
    id: gameId,
  });

  socket.on("players update", (players) => {
    const horseElements = document.querySelectorAll(".horse");
    const leaderboardPlayerElements = document.querySelectorAll("#leaderboard-list li");

    horseElements.forEach((horseElement) => {
      horseElement.style.left = "-100px";
      horseElement.classList.remove("active");
    });

    players.forEach((player, i) => {
      horseElements[i].classList.add("active");
      horseElements[i].style.left = `calc(${Math.min(player.progress, 100)}% - 100px)`;
      horseElements[i].querySelector(".pseudo").innerText = player.name;
    });

    leaderboardPlayerElements.forEach((leaderboardPlayerElement) => {
      leaderboardPlayerElement.innerText = "";
    });

    players
      .sort((a, b) => b.progress - a.progress)
      .forEach((player, i) => {
        leaderboardPlayerElements[i].innerText = player.name;
      });
  });

  socket.on("game status", ({ status }) => {
    const pressToStartElement = document.querySelector("#waiting-text");
    const gameContainer = document.querySelector("#game-container");
    switch (status) {
      case "stopped":
        pressToStartElement.innerText = "Appuyez sur Espace pour avancer !";
        pressToStartElement.classList.remove("disabled");
        gameContainer.classList.remove("running");
        break;
      case "preparing":
        pressToStartElement.innerText = "3";
        pressToStartElement.classList.remove("disabled");
        setTimeout(() => {
          pressToStartElement.innerText = "2";
        }, 1000);
        setTimeout(() => {
          pressToStartElement.innerText = "1";
        }, 2000);
        gameContainer.classList.remove("running");
        break;
      case "running":
        pressToStartElement.classList.add("disabled");
        gameContainer.classList.add("running");
        break;
    }
  });

  socket.on("info", (data) => {
    alert(data.message);
    if (data.needAuth) {
      document.location.href = `/login/index.html?redirectTo=${encodeURIComponent(document.location.href)}`;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === " ") {
      socket.emit("add progress", { gameId });
      if (gameStatus === "stopped") {
        fetch("/api/room/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameId }) });
      }
    }
  });
}
