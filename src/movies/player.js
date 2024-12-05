const player = document.querySelector("#player iframe");

document.querySelectorAll("button.play").forEach(
    button => button.onclick = function({ target }) {
        if (target.disabled) return;
        console.log(target.getAttribute("link"));
    }
);

document.querySelectorAll("button.download").forEach(
    button => button.onclick = function({ target }) {
        if (target.disabled) return;
        const link = target.getAttribute("link");
        if (link) open(link, "_blank")
    }
);
