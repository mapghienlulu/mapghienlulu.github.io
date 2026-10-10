const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("login-error");


let failedAttempts = 0;

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (passwordInput.value === "120426") {
        window.location.href = "album.html";
    } else {
        failedAttempts++;

        if (failedAttempts >= 2) {
            errorMessage.textContent = "Hint: The password is an 6-number PIN";
        } else {
            errorMessage.textContent = "Incorrect password. Try again!";
        }

        passwordInput.focus();
    }
});



// Clear the error when the user edits the password.
passwordInput.addEventListener("input", function () {
    errorMessage.textContent = "";
});
