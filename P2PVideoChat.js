// P2PVideoChat.js
var P2PVideoChat = /** @class */ (function () {
    function P2PVideoChat() {
    }
    P2PVideoChat.prototype.start = function () {
        var _this = this;
        this.peerId = String(Math.floor(Math.random() * 900) + 100);
        var options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options);
        this.peer.on('open', function (id) { return document.getElementById('peerid').innerHTML = id; });
        this.peer.on('error', function (error) { return console.error(error); });
        this.peer.on('call', function (call) { return _this.receiveStream(call); });
        this.peer.on('connection', function (conn) { return _this.receiveConnection(conn); });
        this.getUserMedia();
        this.setVisible('connect', false);
        this.setVisible('chat', false);
        var login = document.getElementById('loginbutton');
        login.addEventListener('click', function () {
            var nameElement = document.getElementById('name');
            var name = nameElement.value;
            console.log(name);
            _this.name = name;
            if (_this.name) {
                var namebox = document.getElementById('namebox');
                namebox.innerHTML = _this.name;
                _this.setVisible('login', false);
                _this.setVisible('connect', true);
            }
        });
        var connect = document.getElementById('connectbutton');
        connect.addEventListener('click', function () {
            var destIdElement = document.getElementById('destid');
            var destId = parseInt(destIdElement.value, 10);
            _this.call(destId);
            _this.connect(destId);
            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
            _this.setVisible('chat', true);
        });
        var send = document.getElementById('sendmessage');
        send.addEventListener('click', function () {
            console.log('send');
            _this.sendMessage();
        });
        var dissconnect = document.getElementById('dissconnectbutton');
        dissconnect.addEventListener('click', function () {
            _this.localStream.getVideoTracks()[0].stop();
            _this.localStream.getAudioTracks()[0].stop();
            _this.localStream = null;
            _this.peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
            _this.peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
            _this.setVisible('login', true);
            _this.setVisible('connect', false);
            _this.setVisible('chat', false);
        });
    };
    P2PVideoChat.prototype.getUserMedia = function () {
        var _this = this;
        var p = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        p.then(function (stream) {
            _this.localStream = stream;
            _this.showVideoSelf(_this.localStream);
        });
        p["catch"](function (e) { return console.error(e); });
    };
    //相手からのcallを受けた時にビデオの表示を行う
    P2PVideoChat.prototype.receiveStream = function (call) {
        var _this = this;
        this.destId = call.peer;
        console.log('called: ' + call.peer);
        call.answer(this.localStream);
        call.on('stream', function (stream) { _this.showVideoDest(stream); });
    };
    //相手からデータを受けた時にメッセージを表示する
    P2PVideoChat.prototype.receiveConnection = function (conn) {
        var _this = this;
        this.dataConnection = conn;
        this.destId = conn.peer;
        // this.dataConnection.on('open', () => {
        this.dataConnection.on('data', function (data) { return _this.receiveMessage(data); });
        // });
    };
    //相手にコールする
    P2PVideoChat.prototype.call = function (destId) {
        var _this = this;
        console.log('callId', destId);
        var call = this.peer.call(destId, this.localStream);
        call.on('stream', function (stream) { _this.showVideoDest(stream); });
    };
    //相手にコネクションを送信する
    P2PVideoChat.prototype.connect = function (destId) {
        var _this = this;
        this.dataConnection = this.peer.connect(destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('data', function (data) { return _this.receiveMessage(data); });
    };
    P2PVideoChat.prototype.sendMessage = function () {
        var messageElement = document.getElementById('message');
        var message = messageElement.value;
        this.dataConnection.send(message);
        var list = document.getElementById('list');
        var list_item = document.createElement('li');
        var text = document.createTextNode(this.peerId + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
        messageElement.value = "";
    };
    P2PVideoChat.prototype.receiveMessage = function (data) {
        console.log(data);
        console.log(this.dataConnection);
        var message = data;
        var list = document.getElementById('list');
        var list_item = document.createElement('li');
        var text = document.createTextNode(this.dataConnection.metadata.name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
    };
    P2PVideoChat.prototype.showVideoDest = function (stream) {
        var video = document.getElementById('video-dest');
        video.src = URL.createObjectURL(stream);
    };
    P2PVideoChat.prototype.showVideoSelf = function (stream) {
        var video = document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    };
    P2PVideoChat.prototype.setVisible = function (id, visible) {
        var element = document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    };
    return P2PVideoChat;
}());
window.onload = function () {
    var vc = new P2PVideoChat();
    vc.start();
};
