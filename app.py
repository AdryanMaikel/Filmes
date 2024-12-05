from secrets import token_hex
from time import time
from datetime import timedelta as td

from flask import Flask, request, render_template, session, abort
from flask import redirect, url_for

from db import users, movies

app = Flask(__name__, static_folder="src", template_folder="pages")
app.secret_key = token_hex(32)
app.jinja_env.variable_start_string = "[["
app.jinja_env.variable_end_string = "]]"
# app.permanent_session_lifetime = td(hours=1)
app.permanent_session_lifetime = td(seconds=1)

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
        return "/Home", 200

    return "Credenciais inválidas", 401


@app.route("/Home", methods=["GET"])
def route_home():
    username = session.get("username")
    if not username or not users.include(username):
        return redirect(url_for("index"))
    return render_template("home.html", _data=movies.get(to_dict=True))


@app.errorhandler(429)
def ratelimit_exceeded(_):
    return "Tente novamente mais tarde.", 429


if __name__ == "__main__":
    app.run(debug=True)
