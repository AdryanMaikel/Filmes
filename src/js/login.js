const form = document.getElementById("form-login");
const inputUsername = form.querySelector("input#username");
const inputPassword = form.querySelector("input#password");

(async function() {
    const credentials = localStorage.getItem("credentials");
    if (credentials) {
        let route = "/login";
        let method = "POST";
        let json = JSON.parse(credentials);
        const response = await request({ route, method, json });
        if (response.status === 200) {
            const route = await response.text();
            setInterval(()=>window.location = route, 1000)
        } else {
            localStorage.removeItem("credentials");
        }
    }
    inputUsername.focus();
})()


const tentatives = [];
const buttonSubmit = form.querySelector("button[type='submit']");

const labelUsername = form.querySelector(`label[for="username"]`);
const spanUsername = labelUsername.querySelector("span");
const labelPassword = form.querySelector(`label[for="password"]`);
const spanPassword = labelPassword.querySelector("span");

const labelNewUser = form.querySelector(`label[for="email"]`);
const inputMail = labelNewUser.querySelector("input");
const spanNewUser = labelNewUser.querySelector("span");

form.onsubmit = async function(event) {
    event.preventDefault();
    const username = inputUsername.value;
    if (!username) {
        labelUsername.classList.add("error");
        spanUsername.innerText = "Digite seu username.";
        inputUsername.focus();
        return;
    }
    if (labelUsername.classList.contains("error")) {
        spanUsername.innerText = "";
        labelUsername.classList.remove("error");
    }
    const password = inputPassword.value;
    if (!password) {
        spanPassword.innerText = "Digite sua senha.";
        labelPassword.classList.add("error");
        inputPassword.focus();
        return;
    }
    if (labelPassword.classList.contains("error")) {
        spanPassword.innerText = "";
        labelPassword.classList.remove("error");
    }
    const mail = inputMail.value;
    if (labelNewUser.classList.contains("open") && !mail) {
        labelNewUser.classList.add("error");
        spanNewUser.innerText = "Informe seu email.";
        inputMail.focus();
        return
    }
    credentials = `${username}${password}`;
    if (tentatives.includes(credentials)) {
        return;
    }
    tentatives.push(credentials)

    let route = "/login";
    let method = "POST";
    let json = { username, password };
    console.log(tentatives);
    const response = await request({ route, method, json });
    const responseText = await response.text();
    switch (response.status) {
        case 200:
            localStorage.setItem("credentials", JSON.stringify(json));
            window.location = responseText;
            break;
        case 400:
            window.alert(responseText);
            break;
        case 401:
            spanPassword.innerText = "Senha incorreta.";
            labelPassword.classList.add("error");
            inputPassword.focus();
            break;
        case 404:
            labelNewUser.classList.add("open");
            inputMail.focus()
            break;
        case 429:
            buttonSubmit.disabled = true;
            setTimeout(()=>buttonSubmit.disabled = false, 60000);
            window.alert(await response.text());
            break;
        default:
            break;
    }
}

form.onreset = function() {
    [spanUsername, spanPassword].forEach(span=>span.textContent = "");
    [labelUsername, labelPassword].forEach(label=>label.classList.remove("error"));
    labelNewUser.classList.remove("open", "error");
    spanNewUser.innerText = "";
}
