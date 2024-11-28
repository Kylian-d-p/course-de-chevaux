import { renderGame } from "../js/render-game.js";

const WAINTING_TEXT = "Appuyer sur espace pour commencer";
const searchParams = new URLSearchParams(window.location.search);

const gameId = searchParams.get("id");

if (typeof gameId !== "string") {
  fetch("/api/room/create", { method: "POST" }).then((res) => {
    res.json().then((data) => {
      if (!res.ok) {
        data.message && alert(data.message);
        return document.location.replace(
          `/login/index.html?redirectTo=${encodeURIComponent(
            window.location.href
          )}`
        );
      }
      document.location.replace(
        `${document.location.pathname}?id=${data.data.gameId}`
      );
    });
  });
} else {
  const codeButton = document.querySelector("#code-game");
  codeButton.addEventListener("click", () => {
    navigator.clipboard.writeText(gameId);
  });

  const socket = io();
  let gameStatus = "stopped";
  let players = [];
  socket.emit("request room play access", {
    id: gameId,
  });

  socket.on("players update", (newPlayers) => {
    players = newPlayers;
    renderGame(players, gameStatus, WAINTING_TEXT);
    console.log(gameStatus);
  });

  socket.on("game status", ({ status: newStatus }) => {
    gameStatus = newStatus;
    renderGame(players, gameStatus, WAINTING_TEXT);
  });

  socket.on("info", (data) => {
    alert(data.message);
    if (data.needAuth) {
      document.location.href = `/login/index.html?redirectTo=${encodeURIComponent(
        document.location.href
      )}`;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === " ") {
      socket.emit("add progress", { gameId });
      if (gameStatus === "stopped") {
        fetch("/api/room/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        });
      }
    }
  });
}
