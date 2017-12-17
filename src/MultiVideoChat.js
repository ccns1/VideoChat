"use strict";
class MultiVideoChat {
    start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.peerOpened((id) => {
            console.log(id);
            const idElement = document.getElementById('peerid-first');
            idElement.innerHTML = id;
        });
        this.firstPeer.peerError(console.error);
        this.firstPeer.peerCalled(this.showVideoFirst);
        this.firstPeer.getUserMedia()
            .then((stream) => {
            console.log(stream);
            this.showVideoSelf(stream);
        })
            .catch((reason) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.secondPeer = new HandlePeer();
        this.secondPeer.peerOpened((id) => {
            console.log(id);
            const idElement = document.getElementById('peerid-second');
            idElement.innerHTML = id;
        });
        this.secondPeer.peerError(console.error);
        this.secondPeer.peerCalled(this.showVideoSecond);
        this.setVisible('connect', false);
        this.setVisible('chat', false);
        const login = document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement = document.getElementById('name');
            const name = nameElement.value;
            console.log(name);
            if (name) {
                this.firstPeer.setName(name);
                const namebox = document.getElementById('namebox');
                namebox.innerHTML = name;
                this.setVisible('login', false);
                this.setVisible('connect', true);
                this.setVisible('chat', true);
            }
        });
        const connectFirst = document.getElementById('connectbutton-first');
        connectFirst.addEventListener('click', () => {
            const destIdElement = document.getElementById('destid-first');
            const destId = parseInt(destIdElement.value, 10);
            this.firstPeer.setDestId(destId);
            this.firstPeer.call(this.showVideoFirst);
            this.setVisible('chat', true);
        });
        const connectSecond = document.getElementById('connectbutton-second');
        connectSecond.addEventListener('click', () => {
            const destIdElement = document.getElementById('destid-second');
            const destId = parseInt(destIdElement.value, 10);
            this.secondPeer.setDestId(destId);
            this.secondPeer.call(this.showVideoSecond);
            this.setVisible('chat', true);
        });
        const dissconnectFirst = document.getElementById('dissconnectbutton');
        dissconnectFirst.addEventListener('click', () => {
            this.firstPeer.reset();
        });
        const dissconnectSecond = document.getElementById('dissconnectbutton');
        dissconnectSecond.addEventListener('click', () => {
            this.secondPeer.reset();
        });
    }
    showVideoFirst(stream) {
        const video = document.getElementById('video-first');
        video.src = URL.createObjectURL(stream);
    }
    showVideoSecond(stream) {
        const video = document.getElementById('video-second');
        video.src = URL.createObjectURL(stream);
    }
    showVideoSelf(stream) {
        const video = document.getElementById('video-self');
        console.log(video);
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0, 0);
    }
    setCanvas(video, cx, cy) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        requestAnimationFrame(() => this.setCanvas(video, cx, cy));
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