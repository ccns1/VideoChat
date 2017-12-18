//HandlePeer.ts
class HandlePeer {
    private name: string;
    private peer: any;
    private peerId: string;
    private destId: number;
    private dataConnection: any;
    private localStream: any;

    constructor() {
        this.peerId = String(Math.floor(Math.random() * 900) + 100);
        const options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options);
    }

    // todo promise
    public peerOpened(handleId: (id: string) => void) {
        console.log('open');
        this.peer.on('open', (id: any) => handleId(id));
    }

    //todo promise
    public peerError(errorCallbadck: any) {
        this.peer.on('error', (error: any) => errorCallbadck(error));
    }

    //相手からのcallを受けた時にビデオの表示を行う
    public peerCalled() {
        return new Promise((resolve, reject) => {
            this.peer.on('call', (call: any) => {
                this.destId = call.peer;
                console.log('call.peer: ' + call.peer);
                call.on('stream', (stream: any) => resolve(stream));
                //todo 設定できるようにする
                call.answer(this.localStream);
            });
        });
    }

    //todo promise
    //相手からデータを受けた時にメッセージを表示する
    public peerConnected(handleData: any) {
        this.peer.on('connection', (connection: any) => {
            this.dataConnection = connection;
            this.destId = connection.peer;
            connection.on('data', (data: any) => handleData(connection.metadata.name, data));
        });
    }

    //todo セッター　ゲッター
    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setDestId(destId: number) {
        this.destId = destId;
    }

    public getDestName() {
        return this.dataConnection.metadata.name;
    }

    public getUserMedia() {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.localStream = stream;
                return stream;
            })
            .catch(error => console.error(error));
    }

    //相手にコールする
    public call() {
        console.log('this.destId' + this.destId);
        const call = this.peer.call(this.destId, this.localStream);
        return new Promise((resolve, jeject) => {
            call.on('stream', (stream: any) => {
                return stream
            });
        });
    }

    //相手にコネクションを送信する
    public connect(message: string) {
        this.dataConnection = this.peer.connect(this.destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('open', () => {
            this.dataConnection.send(message);
        });
    }

    //todo リセット後の再接続エラー
    public reset() {
        //todo localStreamのリセット確認
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.localStream = null;
        this.peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
        this.peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
    }
}