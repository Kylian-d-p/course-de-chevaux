const pseudo = document.querySelector("#pseudo");
const link = document.querySelector("#pseudo-link");

fetch("/api/auth/user").then((res) => {
  res.json().then((data) => {
    if (!data.user) {
      link.href = "/login/index.html";
      pseudo.textContent = "Connexion";
      pseudo.removeAttribute("data-connected");
    } else {
      pseudo.textContent = data.user.pseudo;
      link.href = "#";
      pseudo.setAttribute("data-connected", "true");
    }
  });
});

pseudo.addEventListener("click", (event) => {
  if (event.target.getAttribute("data-connected")) {
    fetch("/api/auth/logout", {method: "POST"}).then(() => {
      document.location.reload();
    });
  }
});
