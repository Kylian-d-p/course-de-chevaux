import { renderGame } from "../js/render-game.js";

const searchParams = new URLSearchParams(window.location.search);
const gameId = searchParams.get("id");
const WAINTING_TEXT = "Faites vos paris maintenant !";

if (typeof gameId !== "string") {
  document.location.replace(`/index.html`);
} else {
  const socket = io();

  let gameStatus = "stopped";
  let players = [];

  const betEventListener = (e) => {
    const i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target);

    if (gameStatus !== "running" && players.length >= i + 1) {
      socket.emit("bet coins", {
        gameId: gameId,
        amount: 10,
        playerId: players[i].id,
      });
    }
  };

  socket.emit("request room spectate access", {
    id: gameId,
  });

  socket.on("players update", (newPlayers) => {
    players = newPlayers;
    renderGame(players, gameStatus, WAINTING_TEXT);

    const bets = document.querySelectorAll(".bet");
    bets.forEach((bet) => {
      bet.removeEventListener("click", betEventListener);
    });

    if (gameStatus !== "running") {
      bets.forEach((bet) => {
        bet.addEventListener("click", betEventListener);
      });
    }
  });

  socket.on("game status", ({ status: newStatus }) => {
    gameStatus = newStatus;
    renderGame(players, gameStatus, WAINTING_TEXT);
  });

  socket.on("info", (data) => {
    alert(data.message);
    if (data.needAuth) {
      document.location.href = `/login/index.html?redirectTo=${encodeURIComponent(document.location.href)}`;
    }
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
