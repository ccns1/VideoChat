// P2PVideoChat.js
window.onload = () => {
    const vc: P2PVideoChat = new P2PVideoChat();
    vc.start();
}

class P2PVideoChat {
    private handler: HandlePeer;

    public start() {
        this.handler = new HandlePeer();
        this.handler.peerOpened((id) => {
            console.log(id);
            const idElement = <HTMLElement>document.getElementById('peerid');
            idElement.innerHTML = id;
        });
        this.handler.peerError(console.error);
        this.handler.peerCalled(this.showVideoDest);
        this.handler.peerConnected(this.receiveMessage);
        this.handler.getUserMedia(this.showVideoSelf, console.error);

        this.setVisible('connect', false);
        this.setVisible('chat', false);

        const login: HTMLElement = <HTMLInputElement>document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById('name');
            const name: string = nameElement.value;
            console.log(name);

            if (name) {
                this.handler.setName(name);
                const namebox: HTMLElement = <HTMLElement>document.getElementById('namebox');
                namebox.innerHTML = name;

                this.setVisible('login', false);
                this.setVisible('connect', true);
                this.setVisible('chat', true);
            }
        });

        const connect: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton');
        connect.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid');
            const destId: number = parseInt(destIdElement.value, 10);

            this.handler.setDestId(destId);
            this.handler.call(this.showVideoDest);
            // this.handler.connect(this.receiveMessage);

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
            this.handler.reset();

            this.setVisible('login', true);
            this.setVisible('connect', false);
            this.setVisible('chat', false);
        });
    }

    private sendMessage() {
        const messageElement: HTMLInputElement = <HTMLInputElement>document.getElementById('message');
        const message: string = messageElement.value;
        console.log("sendMessage: " + message);
        this.handler.connect(message);

        const list: HTMLElement = <HTMLElement>document.getElementById('list');
        const list_item: HTMLElement = <HTMLElement>document.createElement('li');
        const text = document.createTextNode(this.handler.getName() + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);

        messageElement.value = "";
    }

    private receiveMessage(name: string, data: any) {
        console.log('data: ' + data);
        const message: string = data;

        const list: HTMLElement = <HTMLElement>document.getElementById('list');
        const list_item: HTMLElement = <HTMLElement>document.createElement('li');
        const text = document.createTextNode(name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
    }

    private showVideoDest(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-dest');
        video.src = URL.createObjectURL(stream);
    }

    private showVideoSelf(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}
