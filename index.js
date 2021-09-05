import {
    Drawing,
    Shapes
} from "./apps";

document.addEventListener("DOMContentLoaded", () => {
    let app;
    switch (window.location.pathname) {
        case "/draw3d":
            app = new Drawing();
            break;
        case "/shapes":
            app = new Shapes();
            break;
        default:
            const indexContainer = document.querySelector(".all-content");
            indexContainer.style.display = "";
    }
    if (app) {
        window.app = app;
    }
});

