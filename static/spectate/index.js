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
    const horseElements = document.querySelectorAll(".horse");
    const leaderboardPlayerElements = document.querySelectorAll(
      "#leaderboard-list li"
    );

    horseElements.forEach((horseElement) => {
      horseElement.style.left = "-100px";
      horseElement.classList.remove("active");
    });

    players.forEach((player, i) => {
      horseElements[i].classList.add("active");
      horseElements[i].style.left = `calc(${Math.min(
        player.progress,
        100
      )}% - 100px)`;
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
    const pressToStartElement = document.querySelector("#press-to-start");
    const gameContainer = document.querySelector("#game-container");
    switch (status) {
      case "stopped":
        pressToStartElement.innerText = "Faites vos paris ici";
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
      document.location.href = `/login/index.html?redirectTo=${encodeURIComponent(
        document.location.href
      )}`;
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
    document.querySelector(
      "#jackpot"
    ).innerText = `Cagnotte totale: ${totalCoins}`;
  };
  renderTotalCoins();

  socket.on("totalCoins update", (newTotalCoins) => {
    totalCoins = newTotalCoins;
    renderTotalCoins();
  });
}
