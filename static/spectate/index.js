import { renderGame } from "../js/render-horses.js";

const searchParams = new URLSearchParams(window.location.search);

const gameId = searchParams.get("id");

if (typeof gameId !== "string") {
  document.location.replace(`/index.html`);
} else {
  const socket = io();
  let gameStatus = "stopped";

  socket.emit("request room spectate access", {
    id: gameId,
  });

  socket.on("players update", (players) => {
    renderGame(players);
  });

  socket.on("game status", ({ status }) => {
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
          playerPseudo: horseElements[i].querySelector(".pseudo").innerText,
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
