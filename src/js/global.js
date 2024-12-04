async function request({ route, method, json }) {
    if (method === "GET") return await fetch(route);
    const headers = { "Content-type": "application/json;charset=UTF-8" };
    const body = JSON.stringify(json);
    return await fetch(route, { method, headers, body });
}
