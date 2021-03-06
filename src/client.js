"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlePeer_1 = require("./HandlePeer");
class MultiVideoChatClient {
    constructor() {
        this.hostStream = new MediaStream();
    }
    start() {
        this.firstPeer = new HandlePeer_1.default();
        this.firstPeer.getUserMedia()
            .then((stream) => {
            console.log("getUserMedia");
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.opened()
            .then((id) => {
            const idElement = document.getElementById("peerid");
            idElement.innerHTML = id;
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
        this.loginEvent();
        this.callEvent();
        this.dissconnectEvent();
    }
    loginEvent() {
        const login = document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement = document.getElementById("name");
            const name = nameElement.value;
            if (name) {
                this.firstPeer.setName(name);
                const namebox = document.getElementById("namebox");
                namebox.innerHTML = name;
            }
        });
    }
    callEvent() {
        const connectFirst = document.getElementById("connectbutton");
        connectFirst.addEventListener("click", () => {
            const destIdElement = document.getElementById("destid");
            const destId = parseInt(destIdElement.value, 10);
            this.firstPeer.call(destId)
                .then((stream) => {
                console.log("stream catched");
                this.hostStream = stream;
                return this.hostStream;
            })
                .then((stream) => this.showVideoHost(this.hostStream))
                .catch((reason) => console.error(reason));
        });
    }
    dissconnectEvent() {
        const dissconnectFirst = document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.firstPeer.reset();
        });
    }
    showVideoHost(stream) {
        const video = document.getElementById("video-host");
        video.src = URL.createObjectURL(stream);
    }
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.style.display = "block" : element.style.display = "none";
    }
}
window.onload = () => {
    const client = new MultiVideoChatClient();
    client.start();
};
//# sourceMappingURL=client.js.map