fetch("/api/auth/user").then((res) => {
  res.json().then((data) => {
    if (!data.user) {
      const link = document.createElement("a")
      link.href = "/login/index.html"
      const button = document.createElement("button")
      button.textContent = "Connexion"
      button.id = "connect"
      link.append(button)
      document.body.append(link)
    }
    const button = document.createElement("button")
    button.textContent = data.user.pseudo
    button.id = "connect"
    document.body.append(button)
  })
});

