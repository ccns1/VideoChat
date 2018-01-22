class MultiVideoChatClient {
    private firstPeer: HandlePeer;
    private context: any;
    private hostStream = new MediaStream();

    public start() {
        this.firstPeer = new HandlePeer();

        this.firstPeer.getUserMedia()
            .then((stream: any) => {
                console.log("getUserMedia");
                // this.showVideoSelf(stream);
            })
            .catch((reason: any) => console.error(reason));

        this.firstPeer.opened()
            .then((id: any) => {
                const idElement = <HTMLElement>document.getElementById("peerid");
                idElement.innerHTML = id;
            })
            .catch((reason: any) => console.error(reason));

        this.firstPeer.error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));

        this.loginEvent();
        this.callEvent();
        this.dissconnectEvent();
    }

    private loginEvent() {
        // this.setVisible("connect", false);

        const login = <HTMLInputElement>document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
            const name: string = nameElement.value;

            if (name) {
                this.firstPeer.setName(name);
                const namebox: HTMLElement = <HTMLElement>document.getElementById("namebox");
                namebox.innerHTML = name;

                // this.setVisible("login", false);
                // this.setVisible("connect", true);
            }
        });
    }

    private callEvent() {
        const connectFirst: HTMLElement = <HTMLInputElement>document.getElementById("connectbutton");
        connectFirst.addEventListener("click", () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById("destid");
            const destId: number = parseInt(destIdElement.value, 10);

            this.firstPeer.call(destId)
                .then((stream: MediaStream) => {
                    console.log("stream catched");
                    this.hostStream = stream;
                    return this.hostStream;
                })
                //fix 分離する必要があるか
                .then((stream) => this.showVideoHost(this.hostStream))
                .catch((reason: any) => console.error(reason));

            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible("connect", false);
            //todo 接続を受けた場合画面の遷移を行う
        });
    }

    private dissconnectEvent() {
        const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.firstPeer.reset();

            // this.setVisible("login", true);
            // this.setVisible("connect", false);
        });
    }

    // private showVideoSelf(stream: MediaStream) {
    //     const video = <HTMLVideoElement>document.getElementById("video-self");
    //     video.src = URL.createObjectURL(stream);
    // }

    private showVideoHost(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-host");
        video.src = URL.createObjectURL(stream);
    }

    private setVisible(id: string, visible: boolean) {
        const element: HTMLElement = <HTMLElement>document.getElementById(id);
        visible ? element.style.display = "block" : element.style.display = "none";
    }
}

window.onload = () => {
    const client: MultiVideoChatClient = new MultiVideoChatClient();
    client.start();
};
