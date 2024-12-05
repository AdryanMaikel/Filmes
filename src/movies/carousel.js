const friction = 0.80;
const minVelocity = 0.5;
const shadows = document.querySelectorAll(".shadow");

shadows.forEach(shadow => {
    let isDragging = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let rafId;
    let positions = [];
    const carousel = shadow.querySelector(".carousel");
    
    function startScroll() {
        carousel.scrollLeft -= velocity;
        velocity *= friction;
        if (Math.abs(velocity) > minVelocity)
            rafId = requestAnimationFrame(startScroll);
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        carousel.classList.remove("active");
        const now = Date.now();
        const recentPositions = positions.filter(pos => now - pos.time <= 100);
        const first = recentPositions[0];
        const last = recentPositions[recentPositions.length - 1];
        if (last && first) {
            const deltaX = last.x - first.x;
            const deltaTime = last.time - first.time;
            if (deltaTime > 0) velocity = (deltaX / deltaTime) * 16;
        }
        requestAnimationFrame(startScroll);
    };
    
    function startDrag({ pageX }) {
        isDragging = true;
        carousel.classList.add("active");
        startX = pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        velocity = 0;
        cancelAnimationFrame(rafId);
        positions = [];
        positions.push({ x: pageX, time: Date.now() });
    }
    
    function dragging(event) {
        if (!isDragging) return;
        event.preventDefault();
        const x = event.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        carousel.scrollLeft = scrollLeft - walk;
        positions.push({ x: event.pageX, time: Date.now() });
        positions = positions.filter(position => Date.now() - position.time <= 100);
    
    }
        
    function updateShadows() {
        let left = carousel.scrollLeft;
        left > 0 ? shadow.classList.add("left") : shadow.classList.remove("left");
        left < (carousel.scrollWidth - carousel.clientWidth) ? shadow.classList.add("right") : shadow.classList.remove("right");
    }
    
    updateShadows()
    carousel.onscroll = updateShadows;
    carousel.onmousedown = startDrag;
    carousel.onmousemove = dragging;
    carousel.onmouseleave = stopDrag;
    carousel.onmouseup = stopDrag;
});

/*

let touchIsDragging = false;
let touchStartX;
let touchScrollLeft;
let touchVelocity = 0;
let touchPositions = [];

carousel.addEventListener("touchstart", function(e) {
    touchIsDragging = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    touchScrollLeft = carousel.scrollLeft;

    touchVelocity = 0;
    cancelAnimationFrame(rafId);

    touchPositions = [];
    touchPositions.push({ x: e.touches[0].pageX, time: Date.now() });
});

carousel.addEventListener("touchmove", function(e) {
    if (!touchIsDragging) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = touchScrollLeft - walk;

    touchPositions.push({ x: e.touches[0].pageX, time: Date.now() });

    const now = Date.now();
    touchPositions = touchPositions.filter(pos => now - pos.time <= 100);
});

carousel.addEventListener("touchend", () => {
    if (!touchIsDragging) return;
    touchIsDragging = false;
    
    const now = Date.now();
    const recentPositions = touchPositions.filter(pos => now - pos.time <= 100);
    const first = recentPositions[0];
    const last = recentPositions[recentPositions.length - 1];
    if (last && first) {
        const deltaX = last.x - first.x;
        const deltaTime = last.time - first.time;
        
        if (deltaTime > 0) {
            touchVelocity = (deltaX / deltaTime) * 16;
        }
        
        velocity = touchVelocity;
    }
    requestAnimationFrame(startScroll);
});
*/