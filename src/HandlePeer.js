"use strict";
class HandlePeer {
    constructor() {
        this.peerId = String(Math.floor(Math.random() * 900) + 100);
        const options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options);
    }
    opened() {
        console.log('open');
        return new Promise((resolve, reject) => {
            this.peer.on('open', (id) => resolve(id));
        });
    }
    error() {
        return new Promise((resolve, reject) => {
            this.peer.on('error', (error) => resolve(error));
        });
    }
    called() {
        return new Promise((resolve, reject) => {
            this.peer.on('call', (call) => {
                console.log('called from: ' + call.peer);
                this.callConnection = call;
                this.destId = call.peer;
                call.answer(this.localStream);
                call.on('stream', (stream) => resolve(stream));
            });
        });
    }
    calledAnswer(stream) {
        console.log("calledAnswer");
        this.callConnection.answer(stream);
    }
    connected(handleData) {
        this.peer.on('connection', (connection) => {
            this.dataConnection = connection;
            this.destId = connection.peer;
            connection.on('data', (data) => handleData(connection.metadata.name, data));
        });
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    setDestId(destId) {
        this.destId = destId;
    }
    getDestName() {
        return this.dataConnection.metadata.name;
    }
    getUserMedia() {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
            this.localStream = stream;
            return stream;
        })
            .catch(error => console.error(error));
    }
    call() {
        console.log('this.destId: ' + this.destId);
        return new Promise((resolve, jeject) => {
            const call = this.peer.call(this.destId, this.localStream);
            call.on('stream', (stream) => resolve(stream));
        });
    }
    connect(message) {
        this.dataConnection = this.peer.connect(this.destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('open', () => {
            this.dataConnection.send(message);
        });
    }
    reset() {
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.localStream = null;
        this.peer.disconnect();
        this.peer.destroy();
    }
}
//# sourceMappingURL=HandlePeer.js.map