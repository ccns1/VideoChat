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
    peerOpened(handleId) {
        console.log('open');
        this.peer.on('open', (id) => handleId(id));
    }
    peerError(errorCallbadck) {
        this.peer.on('error', (error) => errorCallbadck(error));
    }
    peerCalled() {
        return new Promise((resolve, reject) => {
            this.peer.on('call', (call) => {
                this.destId = call.peer;
                console.log('call.peer: ' + call.peer);
                call.on('stream', (stream) => resolve(stream));
                call.answer(this.localStream);
            });
        });
    }
    peerConnected(handleData) {
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
        console.log('this.destId' + this.destId);
        const call = this.peer.call(this.destId, this.localStream);
        return new Promise((resolve, jeject) => {
            call.on('stream', (stream) => {
                return stream;
            });
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