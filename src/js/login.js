const form = document.getElementById("form-login");
const inputUsername = form.querySelector("input#username");
const inputPassword = form.querySelector("input#password");


function escreverNoInput(input, texto) {
    return new Promise((resolve) => {
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < texto.length) {
                input.value += texto.charAt(i);
                i++;
            } else {
                clearInterval(intervalId); // Para a digitação quando o texto for todo inserido
                resolve(); // Resolve a Promise quando a digitação terminar
            }
        }, 100);
    });
}

const sectionLogin = document.getElementById("section-login");
const sectionPage = document.getElementById("section-page");
const iframe = document.querySelector("iframe");

function disabledSection() {
    sectionLogin.classList.add("close");
    sectionLogin.querySelectorAll("input").forEach(input=>input.disabled = true);
    sectionLogin.querySelectorAll("button").forEach(button=>button.disabled = true);
}

(async function() {
    const credentials = localStorage.getItem("credentials");
    if (credentials) {
        let json = JSON.parse(credentials);
        await escreverNoInput(inputUsername, json.username);
        await escreverNoInput(inputPassword, json.password);
        let route = "/login";
        let method = "POST";
        const response = await request({ route, method, json });
        if (response.status === 200) {
            const route = await response.text();
            iframe.src = route;
            window.onmessage = event => {
                if (event.data === "iframeConcluiu") {
                    disabledSection();
                }
            }
            // setInterval(()=>window.location = route, 1000);
            return;
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

const buttonNewUser = document.querySelector(`button[type="button"]`);
buttonNewUser.onclick = function(event) {
    labelNewUser.classList.add("open");
    inputMail.focus();
    return;
}
