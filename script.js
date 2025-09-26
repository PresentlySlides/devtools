const clientTypes = ["user"];
let currentClientType = 0;

document.getElementById("as").addEventListener("click", () => {
    currentClientType = (currentClientType + 1) % clientTypes.length;
    document.getElementById("as").innerText = `as ${clientTypes[currentClientType]}`;
});

document.getElementById("remember").addEventListener("click", () => {
    const url = document.getElementById("url").value;
    setCookie("url", url, 365);
    message(`Remembered URL: ${url}`);
});

window.onload = () => {
    const rememberedUrl = getCookie("url");
    if (rememberedUrl) {
        document.getElementById("url").value = rememberedUrl;
        message(`Loaded remembered URL: ${rememberedUrl}`);
    }
};

document.getElementById("reload").addEventListener("click", () => {
    document.getElementById("reload").disabled = true;
    location.reload();
});

document.getElementById("cancel").addEventListener("click", () => {
    document.getElementById("failed").style.display = "none";
    document.getElementById("url").disabled = false;
    document.getElementById("connect").disabled = false;
    document.getElementById("as").disabled = false;
});

document.getElementById("continue").addEventListener("click", () => {
    document.getElementById("failed").style.display = "none";
    const url = document.getElementById("url").value;
    connect(url, `/${clientTypes[currentClientType]}`);
});

document.getElementById("connect").addEventListener("click", () => {
    document.getElementById("url").disabled = true;
    document.getElementById("connect").disabled = true;
    document.getElementById("as").disabled = true;
    const url = document.getElementById("url").value;
    message(`Connecting to ${url}...`);
    fetch(url, {method: "GET"})
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            return response.text();
        })
        .then(text => {
            if (text != "presentlyslides") throw new Error("Not a PresentlySlides server.");
            connect(url, `/${clientTypes[currentClientType]}`);
        })
        .catch(err => {
            document.getElementById("failed").style.display = "block";
        });
});

function connect(url, namespace) {
    const socket = io(`${url.replace(/\/+$/, "")}${namespace}`);

    socket.on("connect", () => {
        message("Connected to websocket server.");
        document.getElementById("connection").style.display = "block";
    });

    socket.on("disconnect", () => {
        message("Disconnected from websocket.");
        document.getElementById("connection").style.display = "none";
    });

    socket.on("connect_error", err => {
        message(`Connection error: ${err.message}`);
    });

    socket.on("error", err => {
        message(`Error: ${err}`);
    });

    document.getElementById("disconnect").addEventListener("click", () => {
        socket.disconnect();
        document.getElementById("url").disabled = false;
        document.getElementById("connect").disabled = false;
        document.getElementById("as").disabled = false;
    });

    return socket;
}

function message(txt) {
    document.getElementById("logs").innerText = txt;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
