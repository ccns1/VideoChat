"use strict";
class MultiVideoChatClient {
    constructor() {
        this.hostStream = new MediaStream();
    }
    start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.opened()
            .then((id) => {
            const idElement = document.getElementById("peerid");
            idElement.innerHTML = id;
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
        this.firstPeer.getUserMedia()
            .then((stream) => {
            this.showVideoSelf(stream);
        })
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
            this.firstPeer.setDestId(destId);
            this.firstPeer.call()
                .then((stream) => {
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
    showVideoSelf(stream) {
        const video = document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
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
//# sourceMappingURL=MultiVideoChatClient.js.map