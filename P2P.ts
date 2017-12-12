// P2P.ts
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

class P2P {
    private peer: any;
    private peerId: string;
    private device = { video: true, audio: true };

    public start() {
        this.peerId = String(Math.floor(Math.random() * 900) + 100); //100~900
        var options = { //シグナリングサーバー情報
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options); //Peerを開始しListen状態にする
        this.peer.on('open', (id) => { //Listen状態になった時
            document.getElementById('peerid').innerHTML = id;
        });
        this.peer.on('call', (call) => { //他のPeerからコールを受けた時
            this.receive(call);
        });
    }

    private receive(call) { //ほかのPeerからコールを受けた時
        navigator.getUserMedia(this.device, (mediaStream) => {
            this.showVideoSelf(mediaStream);
            call.answer(mediaStream);
            call.on('stream', (stream) => { this.showVideo(stream); });
        }, (e) => {});
    }

    public call(destId) {
        navigator.getUserMedia(this.device, (mediaStream) => {
            this.showVideoSelf(mediaStream);
            var call = this.peer.call(destId, mediaStream);
            call.on('stream', (stream) => { this.showVideo(stream); });
        }, (e) => {});
    }

    private showVideo(stream) {
        var videoObj = <HTMLVideoElement>document.getElementById('video');
        videoObj.src = URL.createObjectURL(stream);
    }

    private showVideoSelf(stream) {
        var videoObj = <HTMLVideoElement>document.getElementById('video-self');
        videoObj.src = URL.createObjectURL(stream);
    }
}

var pp: P2P = new P2P();
pp.start();
function call(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    pp.call(destPeerId); //コールをかける
}
