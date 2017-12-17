"use strict";
class P2PVideoChat {
    start() {
        this.handler = new HandlePeer();
        this.handler.peerOpened((id) => {
            console.log(id);
            const idElement = document.getElementById('peerid');
            idElement.innerHTML = id;
        });
        this.handler.peerError(console.error);
        this.handler.peerCalled(this.showVideoDest);
        this.handler.peerConnected(this.receiveMessage);
        this.handler.getUserMedia(this.showVideoSelf, console.error);
        this.setVisible('connect', false);
        this.setVisible('chat', false);
        const login = document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement = document.getElementById('name');
            const name = nameElement.value;
            console.log(name);
            if (name) {
                this.handler.setName(name);
                const namebox = document.getElementById('namebox');
                namebox.innerHTML = name;
                this.setVisible('login', false);
                this.setVisible('connect', true);
                this.setVisible('chat', true);
            }
        });
        const connect = document.getElementById('connectbutton');
        connect.addEventListener('click', () => {
            const destIdElement = document.getElementById('destid');
            const destId = parseInt(destIdElement.value, 10);
            this.handler.setDestId(destId);
            this.handler.call(this.showVideoDest);
            this.setVisible('chat', true);
        });
        const send = document.getElementById('sendmessage');
        send.addEventListener('click', () => {
            console.log('send');
            this.sendMessage();
        });
        const dissconnect = document.getElementById('dissconnectbutton');
        dissconnect.addEventListener('click', () => {
            this.handler.reset();
            this.setVisible('login', true);
            this.setVisible('connect', false);
            this.setVisible('chat', false);
        });
    }
    sendMessage() {
        const messageElement = document.getElementById('message');
        const message = messageElement.value;
        console.log("sendMessage: " + message);
        this.handler.connect(message);
        const list = document.getElementById('list');
        const list_item = document.createElement('li');
        const text = document.createTextNode(this.handler.getName() + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
        messageElement.value = "";
    }
    receiveMessage(name, data) {
        console.log('data: ' + data);
        const message = data;
        const list = document.getElementById('list');
        const list_item = document.createElement('li');
        const text = document.createTextNode(name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
    }
    showVideoDest(stream) {
        const video = document.getElementById('video-dest');
        video.src = URL.createObjectURL(stream);
    }
    showVideoSelf(stream) {
        const video = document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    }
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}
window.onload = () => {
    const vc = new P2PVideoChat();
    vc.start();
};
//# sourceMappingURL=P2PVideoChat.js.map