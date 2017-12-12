//P2PFile.ts
var P2PFile = /** @class */ (function () {
    function P2PFile() {
    }
    P2PFile.prototype.start = function () {
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
    P2PFile.prototype.receive = function (conn) {
        var _this = this;
        conn.on('open', function () {
            conn.on('data', function (data) {
                _this.showMessage(data);
            });
        });
    };
    P2PFile.prototype.send = function (destId, msg, file) {
        if (msg)
            this.sendMessage(destId, msg);
        if (file)
            this.sendFile(destId, file);
    };
    P2PFile.prototype.sendMessage = function (destId, msg) {
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
    P2PFile.prototype.sendFile = function (destId, file) {
        var _this = this;
        var reader = new FileReader();
        reader.onload = function (event) {
            var data = {
                destId: destId,
                srcId: _this.peerId,
                file: reader.result,
                name: encodeURIComponent(file.name) //文字化けを防ぐためファイル名をエンコードする
            };
            var conn = _this.peer.connect(destId);
            conn.on('open', function () {
                conn.send(data);
                _this.showMessage(data);
            });
        };
        reader.readAsArrayBuffer(file); //ファイルの読み取り
    };
    P2PFile.prototype.showMessage = function (data) {
        var str = '[' + data.srcId + ' ->' + data.destId + ']' + data.msg;
        if (data.file) {
            var url = URL.createObjectURL(new Blob([data.file])); //Blob形式に変換後、オブジェクトURLに変換
            var name = decodeURIComponent(data.name); //ファイル名をデコードする
            str += '<a href="' + url + '" target="_blank" download="' + name + '">' + name + '</a>'; //dwonload属性に元のファイル名を指定
        }
        else {
            str += data.msg;
        }
        if (data.destId == this.peerId) {
            str = '<b>' + str + '</b>';
        }
        document.getElementById('message').innerHTML += str + '</br>';
    };
    return P2PFile;
}());
var pf = new P2PFile();
pf.start();
function send(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    var msg = obj.message.value; //メッセージの文字列
    var file = obj.file.files[0]; //ファイルオブジェクト
    pf.send(destPeerId, msg, file); //データの送信
}
