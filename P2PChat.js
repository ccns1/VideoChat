//P2PChat.ts
var P2PChat = /** @class */ (function () {
    function P2PChat() {
    }
    P2PChat.prototype.start = function () {
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
        this.peer.on('connection', function (conn) {
            _this.receive(conn);
        });
    };
    P2PChat.prototype.receive = function (conn) {
        var _this = this;
        conn.on('open', function () {
            conn.on('data', function (data) {
                _this.showMessage(data);
            });
        });
    };
    P2PChat.prototype.sendMessage = function (destId, msg) {
        var _this = this;
        var data = {
            destId: destId,
            srcId: this.peerId,
            msg: msg
        };
        var conn = this.peer.connect(destId, { serialization: "json" });
        conn.on('open', function () {
            conn.send(data);
            _this.showMessage(data);
        });
    };
    P2PChat.prototype.showMessage = function (data) {
        var str = '[' + data.srcId + ' ->' + data.destId + ']' + data.msg;
        if (data.destId == this.peerId) {
            str = '<b>' + str + '</b>';
        }
        document.getElementById('message').innerHTML += str + '</br>';
    };
    return P2PChat;
}());
var pc = new P2PChat();
pc.start();
function send(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    var msg = obj.message.value; //メッセージの文字列
    pc.sendMessage(destPeerId, msg); //メッセージの送信
}
