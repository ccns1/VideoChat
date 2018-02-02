/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class HandlePeer {
    constructor() {
        const peerId = String(Math.floor(Math.random() * 900) + 100);
        const options = {
            host: location.hostname,
            port: 9000,
            debug: 3
        };
        this.peer = new Peer(peerId, options);
    }
    opened() {
        console.log('open');
        return new Promise((resolve, reject) => {
            this.peer.on('open', (id) => resolve(id));
        });
    }
    error() {
        return new Promise((resolve, reject) => {
            this.peer.on('error', (error) => resolve(error));
        });
    }
    getUserMedia() {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
            this.localStream = stream;
            return stream;
        })
            .catch(error => console.error(error));
    }
    called(stream) {
        return new Promise((resolve, reject) => {
            this.peer.on('call', (call) => {
                this.destId = call.peer;
                console.log();
                call.answer(stream);
                call.on('stream', (stream) => {
                    resolve({ name: call.metadata, stream: stream });
                });
            });
        });
    }
    call(destId) {
        return new Promise((resolve, jeject) => {
            this.destId = destId;
            const call = this.peer.call(this.destId, this.localStream, { metadata: this.name });
            call.on('stream', (stream) => resolve(stream));
        });
    }
    connected(handleName) {
        return new Promise((resolve, reject) => {
            this.peer.on('connection', (connection) => {
                this.dataConnection = connection;
                this.destId = this.dataConnection.peer;
                handleName(this.dataConnection.metadata.name);
                this.dataConnection.on('data', (data) => resolve(data));
            });
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.dataConnection = this.peer.connect(this.destId, {
                metadata: {
                    name: this.name
                }
            });
            this.dataConnection.on('open', () => {
                this.dataConnection.on('data', (data) => resolve(data));
            });
        });
    }
    sendMessage(message) {
        this.dataConnection.send(message);
    }
    reset() {
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.peer.disconnect();
        this.peer.destroy();
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    setDestId(destId) {
        this.destId = destId;
    }
    getDestName() {
        return this.dataConnection.metadata.name;
    }
}
exports.default = HandlePeer;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const HandlePeer_1 = __webpack_require__(0);
const HandleAudio_1 = __webpack_require__(2);
class MultiVideoChat {
    constructor() {
        this.peer = [];
        this.index = 0;
        this.audio = new HandleAudio_1.default();
        this.conposedStream = new MediaStream();
    }
    init() {
        if (this.index == 0) {
            this.setVisible("login", true);
            this.setVisible("connect", false);
            this.getComposeCanvas();
        }
        this.peer[this.index] = new HandlePeer_1.default();
        this.peer[this.index].opened()
            .then((id) => {
            const tbody = document.getElementById("dest");
            const tr = document.createElement("tr");
            tr.setAttribute("id", this.index.toString());
            tr.insertAdjacentHTML("beforeend", `<td>${id}</td>`);
            tbody.insertAdjacentElement("beforeend", tr);
            const table = document.getElementById("dest-table");
            table.scrollTop = table.scrollHeight;
        })
            .catch((reason) => console.error(reason));
        this.peer[this.index].error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
    }
    login() {
        const login = document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement = document.getElementById("name");
            const name = nameElement.value;
            if (name) {
                this.peer[this.index].setName(name);
                const namebox = document.getElementById("namebox");
                namebox.insertAdjacentText("beforeend", ` ${name}`);
                this.peer[this.index].getUserMedia()
                    .then((stream) => {
                    this.setSelfStreamForCanvas(stream);
                    this.audio.addStream(stream);
                })
                    .catch((reason) => console.error(reason));
                this.setVisible("login", false);
                this.setVisible("connect", true);
            }
        });
    }
    waitToCall() {
        this.peer[this.index].called(this.conposedStream)
            .then((dest) => {
            const tr = document.getElementById(this.index.toString());
            tr.insertAdjacentHTML("beforeend", `<td>${dest.name}</td>`);
            this.setStreamForCanvas(dest.stream);
            const audioStream = this.audio.addStream(dest.stream);
            this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
            this.conposedStream.addTrack(audioStream.getAudioTracks()[0]);
            this.index++;
            this.init();
            this.waitToCall();
        })
            .catch((reason) => console.error(reason));
    }
    setSelfStreamForCanvas(stream) {
        const video = document.getElementById("video-self");
        video.src = URL.createObjectURL(stream);
        this.setCanvas(video, 0);
    }
    setStreamForCanvas(stream) {
        const videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "autoplay");
        videoElement.setAttribute("width", "200");
        videoElement.src = URL.createObjectURL(stream);
        const container = document.getElementById("videos");
        container.insertAdjacentElement("beforeend", videoElement);
        this.setCanvas(videoElement, this.index + 1);
    }
    setCanvas(video, number) {
        const canvas = document.getElementById("conpose-canvas");
        const context = canvas.getContext("2d");
        const cx = number % 4 * canvas.width / 4;
        const cy = Math.floor(number / 4) * canvas.width / 4;
        canvas.style.transform = "scaleX(-1)";
        context.drawImage(video, cx, cy, video.width, (video.width * video.videoHeight) / video.videoWidth);
        requestAnimationFrame(() => this.setCanvas(video, number));
    }
    getComposeCanvas() {
        const canvas = document.getElementById("conpose-canvas");
        this.conposedVideo = canvas.captureStream();
        this.conposedStream.addTrack(this.conposedVideo.getVideoTracks()[0]);
    }
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.removeAttribute("hidden") : element.setAttribute("hidden", "");
    }
}
window.onload = () => {
    const multi = new MultiVideoChat();
    multi.init();
    multi.login();
    multi.waitToCall();
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class HandleAudio {
    constructor() {
        this.audioContext = new window.AudioContext || new webkitAudioContext();
        this.dest = this.audioContext.createMediaStreamDestination();
    }
    addStream(stream) {
        const addSource = this.audioContext.createMediaStreamSource(stream);
        addSource.connect(this.dest);
        return this.dest.stream;
    }
}
exports.default = HandleAudio;


/***/ })
/******/ ]);