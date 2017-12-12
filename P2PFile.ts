//P2PFile.ts
class P2PFile {
    // private peer: Peer; //Peerクラス
    private peer: any; //Peerクラス
    private peerId: string; //PeerID

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
        this.peer.on('connection', (conn) => { //他のPeerから接続を受けた時
            this.receive(conn);
        });
    }

    private receive(conn) { //ほかのPeerから接続を受けた時
        conn.on('open', () => {
            conn.on('data', (data) => {
                this.showMessage(data);
            });
        });
    }

    public send(destId, msg, file) {
        if (msg) this.sendMessage(destId, msg);
        if (file) this.sendFile(destId, file);
    }

    private sendMessage(destId, msg) {
        var data = {
            destId: destId,
            srcId: this.peerId,
            msg: msg
        };
        var conn = this.peer.connect(destId, { serialization: "json" });

        conn.on('open', () => {
            conn.send(data);
            this.showMessage(data);
        });
    }

    private sendFile(destId, file) {
        var reader = new FileReader();
        reader.onload = (event) => {
            var data = {
                destId: destId,
                srcId: this.peerId,
                file: reader.result,
                name: encodeURIComponent(file.name) //文字化けを防ぐためファイル名をエンコードする
            };
            var conn = this.peer.connect(destId);
            conn.on('open', () => {
                conn.send(data);
                this.showMessage(data);
            });
        }
        reader.readAsArrayBuffer(file); //ファイルの読み取り
    }

    private showMessage(data) {
        var str = '[' + data.srcId + ' ->' + data.destId + ']' + data.msg;
        if(data.file) {
            var url = URL.createObjectURL(new Blob([data.file])); //Blob形式に変換後、オブジェクトURLに変換
            var name = decodeURIComponent(data.name); //ファイル名をデコードする
            str += '<a href="' + url + '" target="_blank" download="' + name + '">' + name + '</a>'; //dwonload属性に元のファイル名を指定
        } else {
            str += data.msg;
        }
        if (data.destId == this.peerId) {
            str = '<b>' + str + '</b>';
        }
        document.getElementById('message').innerHTML += str + '</br>';
    }
}

var pf: P2PFile = new P2PFile();
pf.start();
function send(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    var msg = obj.message.value; //メッセージの文字列
    var file = obj.file.files[0]; //ファイルオブジェクト
    pf.send(destPeerId, msg, file); //データの送信
}