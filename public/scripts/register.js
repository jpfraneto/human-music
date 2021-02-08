// let registerForm = document.getElementById("registerForm");
// let registerMessage = document.getElementById("registerMessage");
// registerForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const formInfo = new FormData(registerForm);
//     registerForm.style.display = "none";
//     let formQuery = await fetch("/register", {
//         method : "POST",
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body : formInfo
//       });
//     let response = await formQuery.json();

//     let registerAnswer = document.getElementById("registerAnswer");
//     registerAnswer.innerText = "aloja"
//     registerMessage.style.display = "block";
// })