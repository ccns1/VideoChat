import HandlePeer from "./HandlePeer";

class MultiVideoChatClient {
    private firstPeer: HandlePeer;
    private context: any;
    private hostStream = new MediaStream();

    public init() {
        this.setVisible("login", true);
        this.setVisible("connect", false);

        this.firstPeer = new HandlePeer();

        this.firstPeer.opened()
            .then((id: any) => {
                const idElement = <HTMLElement>document.getElementById("peerid");
                idElement.insertAdjacentText("beforeend", ` ${id}`);
            })
            .catch((reason: any) => console.error(reason));

        this.firstPeer.error()
            .then((error: any) => console.error(error))
            .catch((reason: any) => console.error(reason));

        this.loginEvent();
        this.callEvent();
        // this.disconnectEvent();
    }

    private loginEvent() {
        const login = <HTMLInputElement>document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
            const name: string = nameElement.value;

            if (name) {
                this.firstPeer.setName(name);
                const namebox = <HTMLElement>document.getElementById("namebox");
                namebox.insertAdjacentText("beforeend", ` ${name}`);

                this.firstPeer.getUserMedia()
                    .then((stream: MediaStream) => {
                        console.log("getUserMedia");
                    })
                    .catch((reason: any) => console.error(reason));

                this.setVisible("login", false);
                this.setVisible("connect", true);
            }
        });
    }

    private callEvent() {
        const connectFirst: HTMLElement = <HTMLInputElement>document.getElementById("connectbutton");
        connectFirst.addEventListener("click", () => {
            const destIdElement: HTMLInputElement = <HTMLInputElement>document.getElementById("destid");
            if (destIdElement.value) {
                const destId: string = destIdElement.value;

                // this.firstPeer.connect()
                //     .then((data: any) => {
                //         console.log(data);
                //     })
                //     .catch((reason: any) => console.error(reason));

                this.firstPeer.call(destId)
                    .then((stream: MediaStream) => {
                        this.hostStream = stream;
                        return this.hostStream;
                    })
                    //fix 分離する必要があるか
                    .then((stream) => this.showVideoHost(this.hostStream))
                    .catch((reason: any) => console.error(reason));

                //todo 接続を失敗した場合画面の遷移を行わない
                // this.setVisible("connect", false);
                //todo 接続を受けた場合画面の遷移を行う
            }
        });
    }

    // private disconnectEvent() {
    //     const dissconnectFirst: HTMLInputElement = <HTMLInputElement>document.getElementById("dissconnectbutton");
    //     dissconnectFirst.addEventListener("click", () => {
    //         this.firstPeer.reset();

    //         // this.setVisible("login", true);
    //         // this.setVisible("connect", false);
    //     });
    // }

    private showVideoHost(stream: MediaStream) {
        const video = <HTMLVideoElement>document.getElementById("video-host");
        video.src = URL.createObjectURL(stream);
    }

    private setVisible(id: string, visible: boolean) {
        const element = <HTMLElement>document.getElementById(id);
        visible ? element.removeAttribute("hidden") : element.setAttribute("hidden", "");
    }
}

window.onload = () => {
    const client: MultiVideoChatClient = new MultiVideoChatClient();
    client.init();
};
