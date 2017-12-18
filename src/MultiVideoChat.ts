// P2PVideoChat.js
class MultiVideoChat {
    private firstPeer: HandlePeer;
    private context: any;

    public start() {
        this.firstPeer = new HandlePeer();
        this.firstPeer.peerOpened((id) => {
            console.log(id);
            const idElement = <HTMLElement>document.getElementById('peerid-first');
            idElement.innerHTML = id;
        });
        this.firstPeer.peerError(console.error);
        this.firstPeer.peerCalled()
        .then((stream) => {
            this.showVideoFirst(stream);
        })
        .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'))
        this.firstPeer.getUserMedia()
            .then((stream: any) => {
                this.showVideoSelf(stream);
            })
            .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'))

        this.loginEvent();
        this.connectEvent();
        this.dissconnectEvent();
    }

    private loginEvent() {
        this.setVisible('connect', false);

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
            }
        });
    }

    private connectEvent() {
        const connectFirst: HTMLElement = <HTMLInputElement>document.getElementById('connectbutton-first');
        connectFirst.addEventListener('click', () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById('destid-first');
            const destId: number = parseInt(destIdElement.value, 10);

            this.firstPeer.setDestId(destId);
            this.firstPeer.call()
                .then((stream: any) => {
                    console.log(this);
                    this.showVideoFirst(stream)
                })
                .catch((reason: any) => console.log('Handle rejected promise (' + reason + ') here.'))

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
        this.setCanvas(video, 0);
    }

    private showVideoFirst(stream: any) {
        const video = <HTMLVideoElement>document.getElementById('video-first');
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 1);
    }

    private setCanvas(video: HTMLVideoElement, number: number) {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = <CanvasRenderingContext2D>canvas.getContext('2d');
        const cx = canvas.width - ((number  + 1) * video.width);
        const cy = (number % 4) * video.height;

        canvas.style.transform = 'scaleX(-1)';
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        //todo setCanvasを引数にした場合型が合わずエラー
        requestAnimationFrame(() => this.setCanvas(video, number));
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
