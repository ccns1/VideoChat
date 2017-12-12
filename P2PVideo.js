// P2PVideo.ts
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var P2PVideo = /** @class */ (function () {
    function P2PVideo() {
        this.device = { video: true, audio: true };
    }
    P2PVideo.prototype.start = function () {
        var _this = this;
        this.peerId = String(Math.floor(Math.random() * 900) + 100); //100~900
        var options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options); //Peerを開始しListen状態にする
        this.peer.on('open', function (id) {
            document.getElementById('peerid').innerHTML = id;
        });
        this.peer.on('call', function (call) {
            _this.receive(call);
        });
    };
    P2PVideo.prototype.receive = function (call) {
        var _this = this;
        navigator.getUserMedia(this.device, function (mediaStream) {
            _this.showVideoSelf(mediaStream);
            call.answer(mediaStream);
            call.on('stream', function (stream) { _this.showVideo(stream); });
        }, function (e) { });
    };
    P2PVideo.prototype.call = function (destId) {
        var _this = this;
        navigator.getUserMedia(this.device, function (mediaStream) {
            _this.showVideoSelf(mediaStream);
            var call = _this.peer.call(destId, mediaStream);
            call.on('stream', function (stream) { _this.showVideo(stream); });
        }, function (e) { });
    };
    P2PVideo.prototype.showVideo = function (stream) {
        var videoObj = document.getElementById('video');
        videoObj.src = URL.createObjectURL(stream);
    };
    P2PVideo.prototype.showVideoSelf = function (stream) {
        var videoObj = document.getElementById('video-self');
        videoObj.src = URL.createObjectURL(stream);
    };
    return P2PVideo;
}());
var pv = new P2PVideo();
pv.start();
function call(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    pv.call(destPeerId); //コールをかける
}
