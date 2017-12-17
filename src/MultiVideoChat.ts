// P2PVideoChat.js
class MultiVideoChat {
    private firstPeer: HandlePeer;
    private secondPeer: HandlePeer;
    private context: any;

    public start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.peerOpened((id) => {
            console.log(id);
            const idElement = <HTMLElement>document.getElementById('peerid-first');
            idElement.innerHTML = id;
        });
        this.firstPeer.peerError(console.error);
        this.firstPeer.peerCalled(this.showVideoFirst);
        // this.firstPeer.peerConnected(this.receiveMessage);
        this.firstPeer.getUserMedia()
            .then((stream: any) => {
                console.log(stream);
                this.showVideoSelf(stream);
            })
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'))

        this.secondPeer = new HandlePeer();
        this.secondPeer.peerOpened((id) => {
            console.log(id);
            const idElement = <HTMLElement>document.getElementById('peerid-second');
            idElement.innerHTML = id;
        });
        this.secondPeer.peerError(console.error);
        this.secondPeer.peerCalled(this.showVideoSecond);
        // this.secondPeer.peerConnected(this.receiveMessage);
        // this.secondPeer.getUserMedia(this.showVideoSelf, console.error);

        this.setVisible('connect', false);
        this.setVisible('chat', false);

        const login: HTMLElement = <HTMLInputElement>document.getElementById('loginbutton');
        login.addEventListener('click', () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById('name');
            const name: string = nameElement.value;
            console.log(name);

            if (name) {
                this.firstPeer.setName(name);
                const namebox: HTMLElement = <HTMLElement>document.getElementById('namebox');
                namebox.innerHTML = name;

                this.setVisible('login', false);
                this.setVisible('connect', true);
                this.setVisible('chat', true);
            }
        });

        const connectFirst: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton-first');
        connectFirst.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid-first');
            const destId: number = parseInt(destIdElement.value, 10);

            this.firstPeer.setDestId(destId);
            this.firstPeer.call(this.showVideoFirst);

            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
            this.setVisible('chat', true);
        });

        const connectSecond: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton-second');
        connectSecond.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid-second');
            const destId: number = parseInt(destIdElement.value, 10);

            this.secondPeer.setDestId(destId);
            this.secondPeer.call(this.showVideoSecond);

            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
            this.setVisible('chat', true);
        });

        // const send: HTMLInputElement = <HTMLInputElement>document.getElementById('sendmessage');
        // send.addEventListener('click', () => {
        //     console.log('send');
        //     this.sendMessage();
        // });

        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById('dissconnectbutton');
        dissconnectFirst.addEventListener('click', () => {
            this.firstPeer.reset();

            // this.setVisible('login', true);
            // this.setVisible('connect', false);
            // this.setVisible('chat', false);
        });

        const dissconnectSecond: HTMLInputElement = <HTMLInputElement>document.getElementById('dissconnectbutton');
        dissconnectSecond.addEventListener('click', () => {
            this.secondPeer.reset();

            // this.setVisible('login', true);
            // this.setVisible('connect', false);
            // this.setVisible('chat', false);
        });
    }

    // todo thisが未定義になる
    // public setCanvas(video: any) {
    //     const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    //     const context = <CanvasRenderingContext2D>canvas.getContext('2d');
    //     context.drawImage(video, 0, 0, canvas.width, canvas.height);
    //     //todo setCanvasを引数にした場合型が合わずエラー
    //     requestAnimationFrame(() => this.setCanvas(video));
    // }

    // private sendMessage() {
    //     const messageElement: HTMLInputElement = <HTMLInputElement>document.getElementById('message');
    //     const message: string = messageElement.value;
    //     console.log('sendMessage: ' + message);
    //     this.firstPeer.connect(message);

    //     const list: HTMLElement = <HTMLElement>document.getElementById('list');
    //     const list_item: HTMLElement = <HTMLElement>document.createElement('li');
    //     const text = document.createTextNode(this.firstPeer.getName() + ': ' + message);
    //     list.appendChild(list_item);
    //     list_item.appendChild(text);

    //     messageElement.value = '';
    // }

    // private receiveMessage(name: string, data: any) {
    //     console.log('data: ' + data);
    //     const message: string = data;

    //     const list: HTMLElement = <HTMLElement>document.getElementById('list');
    //     const list_item: HTMLElement = <HTMLElement>document.createElement('li');
    //     const text = document.createTextNode(name + ': ' + message);
    //     list.appendChild(list_item);
    //     list_item.appendChild(text);
    // }

    private showVideoFirst(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-first');
        video.src = URL.createObjectURL(stream);
    }

    private showVideoSecond(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-second');
        video.src = URL.createObjectURL(stream);
    }

    private showVideoSelf(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-self');
        console.log(video);
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0, 0);
    }

    private setCanvas(video: HTMLVideoElement, cx: number, cy: number) {
        //todo クロージャによりカウンタを保持し配置を動的に決める
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = <CanvasRenderingContext2D>canvas.getContext('2d');

        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        //todo setCanvasを引数にした場合型が合わずエラー
        requestAnimationFrame(() => this.setCanvas(video, cx, cy));
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    }
}

window.onload = () => {
    const multi: MultiVideoChat = new MultiVideoChat();
    multi.start();
};
