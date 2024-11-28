export function renderGame(players, status, waitingText) {
  // Render horses
  const horseElements = document.querySelectorAll(".horse");

  horseElements.forEach((horseElement) => {
    horseElement.style.left = "-100px";
    horseElement.classList.remove("active");
  });

  players.forEach((player, i) => {
    horseElements[i].classList.add("active");
    horseElements[i].style.left = `calc(${Math.min(player.progress, 100)}% - 100px)`;
    horseElements[i].querySelector(".pseudo").innerText = player.pseudo;
  });

  // Render leaderboard
  const leaderboardPlayerElements = document.querySelectorAll("#leaderboard-list li");

  leaderboardPlayerElements.forEach((leaderboardPlayerElement) => {
    leaderboardPlayerElement.innerText = "";
  });

  players
    .sort((a, b) => b.progress - a.progress)
    .forEach((player, i) => {
      leaderboardPlayerElements[i].innerText = player.pseudo;
    });

  // Render game status
  const waitingTextElement = document.querySelector("#waiting-text");
  const gameContainer = document.querySelector("#game-container");
  switch (status) {
    case "stopped":
      waitingTextElement.innerText = waitingText;
      waitingTextElement.classList.remove("disabled");
      gameContainer.classList.remove("running");
      break;
    case "preparing":
      waitingTextElement.innerText = "3";
      waitingTextElement.classList.remove("disabled");
      setTimeout(() => {
        waitingTextElement.innerText = "2";
      }, 1000);
      setTimeout(() => {
        waitingTextElement.innerText = "1";
      }, 2000);
      gameContainer.classList.remove("running");
      break;
    case "running":
      waitingTextElement.classList.add("disabled");
      gameContainer.classList.add("running");
      break;
  }
}
