import { renderGame } from "../js/render-game.js";

const searchParams = new URLSearchParams(window.location.search);

const gameId = searchParams.get("id");
const WAINTING_TEXT = "Faites vos paris maintenant !"


if (typeof gameId !== "string") {
  document.location.replace(`/index.html`);
} else {
  const socket = io();
  let gameStatus = "stopped";
  let players = []
  socket.emit("request room spectate access", {
    id: gameId,
  });

  socket.on("players update", (newPlayers) => {
    players = newPlayers
    renderGame(players, gameStatus, WAINTING_TEXT);
  });

  socket.on("game status", ({ newStatus }) => {
    gameStatus = newStatus
    renderGame(players, gameStatus, WAINTING_TEXT);
  });

  socket.on("info", (data) => {
    alert(data.message);
    if (data.needAuth) {
      document.location.href = `/login/index.html?redirectTo=${encodeURIComponent(document.location.href)}`;
    }
  });

  const bets = document.querySelectorAll(".bet");

  bets.forEach((bet, i) => {
    bet.addEventListener("click", () => {
      if (gameStatus === "stopped" || gameStatus === "preparing") {
        socket.emit("bet coins", {
          gameId: gameId,
          amount: 10,
          playerPseudo: players[i].innerText,
        });
      }
    });
  });

  let totalCoins = 0;

  const renderTotalCoins = () => {
    document.querySelector("#jackpot").innerText = `Cagnotte totale: ${totalCoins}`;
  };
  renderTotalCoins();

  socket.on("totalCoins update", (newTotalCoins) => {
    totalCoins = newTotalCoins;
    renderTotalCoins();
  });
}
