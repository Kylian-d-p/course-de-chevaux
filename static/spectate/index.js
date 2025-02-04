import { renderGame } from "../js/render-game.js";

const searchParams = new URLSearchParams(window.location.search);
const gameId = searchParams.get("id");
const WAITING_TEXT = "Faites vos paris maintenant !";

if (typeof gameId !== "string") {
  document.location.replace(`/index.html`);
} else {
  const socket = io();

  let gameStatus = "stopped";
  let players = [];

  socket.emit("request room spectate access", {
    id: gameId,
  });

  socket.on("players update", (newPlayers) => {
    players = newPlayers;
    renderGame(players, gameStatus, WAITING_TEXT);

    const bets = document.querySelectorAll(".bet");
    bets.forEach((bet, i) => {
      if (gameStatus !== "running") {
        bet.onclick = (e) => {
          const i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target);

          if (gameStatus !== "running" && players.length >= i + 1) {
            socket.emit("bet coins", {
              gameId: gameId,
              amount: 10,
              playerId: players[i].id,
            });
          }
        };
      } else {
        bet.onclick = null;
      }
      bet.removeAttribute("disabled");
      if (i + 1 > players.length) {
        bet.setAttribute("disabled", "");
      }
    });
  });

  socket.on("game status", ({ status: newStatus }) => {
    gameStatus = newStatus;
    renderGame(players, gameStatus, WAITING_TEXT);
    if (newStatus === "stopped") {
      document.location.reload();
    }
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
    console.log(newTotalCoins);
    totalCoins = newTotalCoins;
    renderTotalCoins();
  });

  const wallet = document.querySelector("#wallet-value");
  socket.on("my coins", (myCoins) => {
    wallet.textContent = myCoins;
  });
}
