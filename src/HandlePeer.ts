import { resolve } from "path";

class HandlePeer {
    private name: string;
    private peer: PeerJs.Peer;
    private destId: string;
    private dataConnection: PeerJs.DataConnection;
    private localStream: MediaStream;

    constructor() {
        const peerId = String(Math.floor(Math.random() * 900) + 100);
        const options = {
            host: location.hostname,
            port: 9000,
            debug: 3
        };
        this.peer = new Peer(peerId, options);
    }

    public opened(): Promise<string> {
        console.log('open');
        return new Promise((resolve, reject) => {
            this.peer.on('open', (id: string) => resolve(id));
        });
    }

    public error(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.peer.on('error', (error: any) => resolve(error))
        });
    }

    public getUserMedia(): any {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.localStream = stream;
                return stream;
            })
            .catch(error => console.error(error));
    }

    //相手からのcallを受けた時にビデオの表示を行う
    public called(stream: MediaStream): Promise<{ name: string, stream: MediaStream }> {
        return new Promise((resolve, reject) => {
            this.peer.on('call', (call: PeerJs.MediaConnection) => {
                this.destId = call.peer;
                console.log();
                call.answer(stream);
                call.on('stream', (stream: MediaStream) => {
                    resolve({ name: call.metadata, stream: stream })
                });
            });
        });
    }

    public call(destId: string): Promise<MediaStream> {
        return new Promise((resolve, jeject) => {
            this.destId = destId;
            const call = this.peer.call(this.destId, this.localStream, { metadata: this.name });
            call.on('stream', (stream: MediaStream) => resolve(stream));
        });
    }

    //相手からデータを受けた時にメッセージを表示する
    public connected(handleName: (destName: string) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            this.peer.on('connection', (connection: PeerJs.DataConnection) => {
                this.dataConnection = connection;
                this.destId = this.dataConnection.peer;
                handleName(this.dataConnection.metadata.name);

                //fix connected connectのメソッドをまとめる
                this.dataConnection.on('data', (data: any) => resolve(data));
            });
        });
    }

    //相手にコネクションを送信する
    public connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dataConnection = this.peer.connect(this.destId, {
                metadata: {
                    name: this.name
                }
            });
            this.dataConnection.on('open', () => {
                this.dataConnection.on('data', (data: any) => resolve(data));
            });
        });
    }

    public sendMessage(message: string) {
        this.dataConnection.send(message);
    }

    public reset() {
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
        this.peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setDestId(destId: string) {
        this.destId = destId;
    }

    public getDestName() {
        return this.dataConnection.metadata.name;
    }
}

export default HandlePeer;