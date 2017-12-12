// P2PVideoChat.js
class P2PVideoChat {
    private name: string;
    private peer: any;
    private peerId: string;
    private destId: string;
    private dataConnection: any;
    private localStream;

    public start() {
        this.peerId = String(Math.floor(Math.random() * 900) + 100);
        const options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options);
        this.peer.on('open', id => document.getElementById('peerid').innerHTML = id);
        this.peer.on('error', error => console.error(error));
        this.peer.on('call', call => this.receiveStream(call));
        this.peer.on('connection', conn => this.receiveConnection(conn));

        this.getUserMedia();

        this.setVisible('connect', false);
        this.setVisible('chat', false);

        const login: HTMLElement = <HTMLInputElement>document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById('name');
            const name: string = nameElement.value;
            console.log(name);
            this.name = name;
            if (this.name) {
                const namebox: HTMLElement = <HTMLElement>document.getElementById('namebox');
                namebox.innerHTML = this.name;

                this.setVisible('login', false);
                this.setVisible('connect', true);
            }
        });

        const connect: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton');
        connect.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid');
            const destId: number = parseInt(destIdElement.value, 10);

            this.call(destId);
            this.connect(destId);

            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
            this.setVisible('chat', true);
        });

        const send: HTMLInputElement = <HTMLInputElement>document.getElementById('sendmessage');
        send.addEventListener('click', () => {
            console.log('send');
            this.sendMessage();
        });

        const dissconnect: HTMLInputElement = <HTMLInputElement>document.getElementById('dissconnectbutton');
        dissconnect.addEventListener('click', () => {
            this.reset();

            this.setVisible('login', true);
            this.setVisible('connect', false);
            this.setVisible('chat', false);
        });
    }

    private getUserMedia() {
        const p = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        p.then(stream => {
            this.localStream = stream;
            this.showVideoSelf(this.localStream);
        });
        p.catch(e => console.error(e));
    }

    //相手からのcallを受けた時にビデオの表示を行う
    private receiveStream(call) {
        this.destId = call.peer;
        console.log('called: ' + call.peer);
        call.answer(this.localStream);
        call.on('stream', stream => { this.showVideoDest(stream) });
    }

    //相手からデータを受けた時にメッセージを表示する
    private receiveConnection(conn) {
        this.dataConnection = conn;
        this.destId = conn.peer;
        // this.dataConnection.on('open', () => {
        this.dataConnection.on('data', data => this.receiveMessage(data));
        // });
    }

    //相手にコールする
    private call(destId) {
        console.log('callId', destId);
        const call = this.peer.call(destId, this.localStream);
        call.on('stream', stream => { this.showVideoDest(stream); });
    }

    //相手にコネクションを送信する
    private connect(destId) {
        this.dataConnection = this.peer.connect(destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('data', data => this.receiveMessage(data));
    }

    private sendMessage() {
        const messageElement: HTMLInputElement = <HTMLInputElement>document.getElementById('message');
        const message: string = messageElement.value;
        this.dataConnection.send(message);

        const list: HTMLElement = <HTMLElement>document.getElementById('list');
        const list_item: HTMLElement = <HTMLElement>document.createElement('li');
        const text = document.createTextNode(this.name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);

        messageElement.value = "";
    }

    private receiveMessage(data) {
        console.log(data);
        const message: string = data;

        const list: HTMLElement = <HTMLElement>document.getElementById('list');
        const list_item: HTMLElement = <HTMLElement>document.createElement('li');
        const text = document.createTextNode(this.dataConnection.metadata.name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
    }

    private showVideoDest(stream) {
        const video = <HTMLVideoElement>document.getElementById('video-dest');
        video.src = URL.createObjectURL(stream);
    }

    private showVideoSelf(stream) {
        const video = <HTMLVideoElement>document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    }

    private reset() {
        //todo localStreamのリセット確認
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.localStream = null;
        this.peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
        this.peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}

window.onload = () => {
    const vc: P2PVideoChat = new P2PVideoChat();
    vc.start();
}