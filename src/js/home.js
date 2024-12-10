const section = document.querySelector("section");

function createCard(movie) {
    return `
<div class="card" id="card-${movie.id}">
    <img src="${movie.image}" class="background">
    <button class="play"><i class="fa-solid fa-play"></i></button>
</div>`;
}

function createUlMovies() {
    [...new Set(data.map(movie => movie.name))].forEach(name=>{
        movies = data.filter(movie => movie["name"] === name);
        const shadow = document.createElement("div");
        shadow.className = "shadow";
        shadow.innerHTML = name;
        const carousel = document.createElement("div");
        carousel.className = "carousel";
        shadow.append(carousel);
        movies.forEach(movie=> carousel.innerHTML += createCard(movie));
        section.append(shadow)
    });
}




(async function() {
    if (!data) {
        window.parent.postMessage("semDados", "*");
        return;
    }

    createUlMovies()
    window.parent.postMessage("iframeConcluiu", "*");
})()


function test() {
    const names = [...new Set(data.map(movie => movie.name))];
    names.forEach(nome => {
        const ul = document.createElement("ul");
        ul.innerHTML = `<strong>Filmes: ${nome}</strong>`;
        console.log(movies);
        const carousel = document.createElement("div");
        carousel.className = "carousel";
        movies.forEach(movie => {
            const li = document.createElement("li");
            li.innerHTML += `
<div id="card-${movie.id}" class="card">
    ${movie.name || ''} ${movie.sequence || ''}
    <label>
        Dublado?:
        <input type="checkbox" name="dubbed" ${movie.dubbed ? 'checked' : ''}>
    </label>
    <label>
        Quality:
        <input type="checkbox" name="quality" ${movie.quality ? 'checked' : ''}>
    </label>
    <label>
        Player:
        <input type="text" value="${movie.player || ''}" name="player">
    </label>
    <label>
        Ano:
        <input type="number" value="${movie.year || ''}" name="year">
    </label>
    <label>
        Gênero:
        <input type="text" value="${movie.genre || ''}" name="genre">
    </label>
</div>`;
            carousel.appendChild(li);
        });
        ul.appendChild(carousel);
        section.appendChild(ul);
    });
}