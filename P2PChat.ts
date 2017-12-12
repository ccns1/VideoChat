//P2PChat.ts
class P2PChat {
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

    public sendMessage(destId, msg) {
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

    private showMessage(data) {
        var str = '[' + data.srcId + ' ->' + data.destId + ']' + data.msg;
        if (data.destId == this.peerId) {
            str = '<b>' + str + '</b>';
        }
        document.getElementById('message').innerHTML += str + '</br>';
    }
}

var pc: P2PChat = new P2PChat();
pc.start();
function send(obj) {
    var destPeerId = obj.peerid.value; //接続先PeerID
    var msg = obj.message.value; //メッセージの文字列
    pc.sendMessage(destPeerId, msg); //メッセージの送信
}