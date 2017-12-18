"use strict";
class MultiVideoChat {
    start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.opened()
            .then((id) => {
            console.log(id);
            const idElement = document.getElementById('peerid-first');
            idElement.innerHTML = id;
        })
            .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.firstPeer.error()
            .then((error) => console.error(error))
            .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.firstPeer.called()
            .then((stream) => {
            this.showVideoFirst(stream);
        })
            .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.firstPeer.getUserMedia()
            .then((stream) => {
            this.showVideoSelf(stream);
        })
            .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.loginEvent();
        this.callEvent();
        this.dissconnectEvent();
    }
    loginEvent() {
        const login = document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement = document.getElementById('name');
            const name = nameElement.value;
            console.log(name);
            if (name) {
                this.firstPeer.setName(name);
                const namebox = document.getElementById('namebox');
                namebox.innerHTML = name;
            }
        });
    }
    callEvent() {
        const connectFirst = document.getElementById('connectbutton-first');
        connectFirst.addEventListener('click', () => {
            const destIdElement = document.getElementById('destid-first');
            const destId = parseInt(destIdElement.value, 10);
            this.firstPeer.setDestId(destId);
            this.firstPeer.call()
                .then((stream) => this.showVideoFirst(stream))
                .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        });
    }
    dissconnectEvent() {
        const dissconnectFirst = document.getElementById('dissconnectbutton');
        dissconnectFirst.addEventListener('click', () => {
            this.firstPeer.reset();
        });
    }
    showVideoSelf(stream) {
        const video = document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }
    showVideoFirst(stream) {
        console.log("showVideoFirst");
        const video = document.getElementById('video-first');
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 1);
    }
    setCanvas(video, number) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const cx = canvas.width - ((number + 1) * video.width);
        const cy = (number % 4) * video.height;
        canvas.style.transform = 'scaleX(-1)';
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        this.conposedStream = canvas.captureStream();
        requestAnimationFrame(() => this.setCanvas(video, number));
    }
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}
window.onload = () => {
    const multi = new MultiVideoChat();
    multi.start();
};
//# sourceMappingURL=MultiVideoChat.js.map