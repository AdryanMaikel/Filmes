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
            window.location = await response.text();
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


form.onsubmit = async function(event) {
    event.preventDefault();
    const username = inputUsername.value;
    if (!username) {
        inputUsername.parentElement.classList.add("error");
        spanUsername.innerText = "Digite seu username.";
        inputUsername.focus();
        return;
    }
    const password = inputPassword.value;
    if (!password) {
        spanPassword.innerText = "Digite sua senha.";
        inputPassword.parentElement.classList.add("error");
        inputPassword.focus();
        return;
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
    switch (response.status) {
        case 200:
            localStorage.setItem("credentials", JSON.stringify(json));
            window.location = await response.text();
            break;
        case 400:
            window.alert(await response.text());
            break;
        case 401:
            spanPassword.innerText = "Senha incorreta.";
            labelPassword.classList.add("error");
            inputPassword.focus();
            break;
        case 404:
            
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
}
