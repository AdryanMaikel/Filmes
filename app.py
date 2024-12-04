from secrets import token_hex
from time import time

from flask import Flask, request, render_template, session, abort

from db import users

app = Flask(__name__, static_folder="src", template_folder="pages")
app.secret_key = token_hex(32)

route_limits = {
    "index": {"limit": 5, "time": 60},
    "route_login": {"limit": 3, "time": 60},
    # "route_home": {"limit": 15, "time": 120}
}


@app.before_request
def limit_request():
    # print(request.endpoint)
    if request.endpoint in route_limits:
        check_rate_limit(request.endpoint)


def check_rate_limit(route: str):
    current_time = time()

    limits_per_route = route_limits.get(route, {})
    limit_time = limits_per_route.get("time_window", 60)

    route_data = [_time for _time in session.get(route, [])
                  if current_time - _time < limit_time]

    if len(route_data) >= limits_per_route.get("limit", 5):
        abort(429, description="Tente novamente mais tarde.")

    route_data.append(current_time)
    session[route] = route_data


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login", methods=["POST"])
def route_login():
    data = dict(request.get_json())

    username = data.get("username", "")
    if not username:
        return "Usuário faltando.", 400

    if not users.include(username):
        return "Usuário não cadastrado", 404

    password = data.get("password", "")
    if not password:
        return "Senha faltando.", 400

    credentials = {"username": username, "password": password}

    if users.check_login(**credentials):
        session["username"] = username
        return "/home", 200

    return "Credenciais inválidas", 401


@app.route("/home", methods=["GET"])
def route_home():
    username = session.get("username")
    if not username or not users.include(username):
        return "Sem acesso a esta página", 401
    return render_template("home.html")


@app.errorhandler(429)
def ratelimit_exceeded(_):
    return "Tente novamente mais tarde.", 429


if __name__ == "__main__":
    app.run(debug=True)
