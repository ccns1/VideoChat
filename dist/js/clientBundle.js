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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
                console.log('called from: ' + call.peer);
                this.destId = call.peer;
                call.answer(stream);
                call.on('stream', (stream) => {
                    resolve(stream);
                });
            });
        });
    }
    call(destId) {
        return new Promise((resolve, jeject) => {
            this.destId = destId;
            console.log('this.destId: ' + this.destId);
            const call = this.peer.call(this.destId, this.localStream);
            call.on('stream', (stream) => resolve(stream));
        });
    }
    connected(handleData) {
        this.peer.on('connection', (connection) => {
            this.dataConnection = connection;
            this.destId = connection.peer;
            connection.on('data', (data) => handleData(connection.metadata.name, data));
        });
    }
    connect(message) {
        this.dataConnection = this.peer.connect(this.destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('open', () => {
            this.dataConnection.send(message);
        });
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
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const HandlePeer_1 = __webpack_require__(0);
class MultiVideoChatClient {
    constructor() {
        this.hostStream = new MediaStream();
    }
    start() {
        this.firstPeer = new HandlePeer_1.default();
        this.firstPeer.getUserMedia()
            .then((stream) => {
            console.log("getUserMedia");
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.opened()
            .then((id) => {
            const idElement = document.getElementById("peerid");
            idElement.innerHTML = id;
        })
            .catch((reason) => console.error(reason));
        this.firstPeer.error()
            .then((error) => console.error(error))
            .catch((reason) => console.error(reason));
        this.loginEvent();
        this.callEvent();
        this.dissconnectEvent();
    }
    loginEvent() {
        const login = document.getElementById("loginbutton");
        login.addEventListener("click", () => {
            const nameElement = document.getElementById("name");
            const name = nameElement.value;
            if (name) {
                this.firstPeer.setName(name);
                const namebox = document.getElementById("namebox");
                namebox.innerHTML = name;
            }
        });
    }
    callEvent() {
        const connectFirst = document.getElementById("connectbutton");
        connectFirst.addEventListener("click", () => {
            const destIdElement = document.getElementById("destid");
            const destId = parseInt(destIdElement.value, 10);
            this.firstPeer.call(destId)
                .then((stream) => {
                console.log("stream catched");
                this.hostStream = stream;
                return this.hostStream;
            })
                .then((stream) => this.showVideoHost(this.hostStream))
                .catch((reason) => console.error(reason));
        });
    }
    dissconnectEvent() {
        const dissconnectFirst = document.getElementById("dissconnectbutton");
        dissconnectFirst.addEventListener("click", () => {
            this.firstPeer.reset();
        });
    }
    showVideoHost(stream) {
        const video = document.getElementById("video-host");
        video.src = URL.createObjectURL(stream);
    }
    setVisible(id, visible) {
        const element = document.getElementById(id);
        visible ? element.style.display = "block" : element.style.display = "none";
    }
}
window.onload = () => {
    const client = new MultiVideoChatClient();
    client.start();
};


/***/ })
/******/ ]);