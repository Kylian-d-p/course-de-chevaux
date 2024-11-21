document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ pseudo: formData.get("pseudo"), password: formData.get("password") }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    res
      .json()
      .then((data) => {
        if (!res.ok) {
          const errorMessageElement = document.querySelector("#error-message");
          errorMessageElement.classList.add("visible");

          if (data.message) {
            errorMessageElement.innerText = data.message;
          } else {
            errorMessageElement.innerText = "Une erreur inattendue est survenue";
          }
          return;
        }
        document.location.href = new URLSearchParams(window.location.search).get("redirectTo") || `${document.location.origin}/index.html`;
      })
      .catch(() => {
        const errorMessageElement = document.querySelector("#error-message");
        errorMessageElement.classList.add("visible");
        errorMessageElement.innerText = "Une erreur inattendue est survenue";
      });
  });
});
