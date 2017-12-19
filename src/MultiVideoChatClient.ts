// P2PVideoChat.js
class MultiVideoChatClient {
    private firstPeer: HandlePeer;
    private context: any;
    private conposedStream: any;

    public start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.opened()
            .then((id: any) => {
                console.log(id);
                const idElement = <HTMLElement>document.getElementById('peerid-first');
                idElement.innerHTML = id;
            })
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.firstPeer.error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'));
            // this.firstPeer.callConnected()
            this.firstPeer.called()
            .then((stream: any) => {
                // this.firstPeer.calledAnswer(this.conposedStream);
                this.showVideoFirst(stream);
            })
            // .then(() => this.firstPeer.calledAnswer(this.conposedStream(this.conposedStream)))
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'));
        this.firstPeer.getUserMedia()
            .then((stream: any) => {
                this.showVideoSelf(stream);
            })
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'));

        this.loginEvent();
        this.callEvent();
        this.dissconnectEvent();
    }

    private loginEvent() {
        // this.setVisible('connect', false);

        const login = <HTMLInputElement>document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById('name');
            const name: string = nameElement.value;
            console.log(name);

            if (name) {
                this.firstPeer.setName(name);
                const namebox: HTMLElement = <HTMLElement>document.getElementById('namebox');
                namebox.innerHTML = name;

                // this.setVisible('login', false);
                // this.setVisible('connect', true);
            }
        });
    }

    private callEvent() {
        const connectFirst: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton-first');
        connectFirst.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid-first');
            const destId: number = parseInt(destIdElement.value, 10);

            this.firstPeer.setDestId(destId);
            this.firstPeer.call()
                .then((stream: any) => this.showVideoFirst(stream))
                .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'));

            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
        });
    }

    private dissconnectEvent() {
        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById('dissconnectbutton');
        dissconnectFirst.addEventListener('click', () => {
            this.firstPeer.reset();

            // this.setVisible('login', true);
            // this.setVisible('connect', false);
        });
    }

    // todo allquery
    private showVideoSelf(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    }

    private showVideoFirst(stream: any) {
        console.log("showVideoHost");
        const video = <HTMLVideoElement>document.getElementById('video-first');
        video.src = URL.createObjectURL(stream);
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}

window.onload = () => {
    const client: MultiVideoChatClient = new MultiVideoChatClient();
    client.start();
};
