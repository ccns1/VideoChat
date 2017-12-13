"use strict";
// P2PVideoChat.js
window.onload = function () {
    var vc = new P2PVideoChat();
    vc.start();
};
var P2PVideoChat = /** @class */ (function () {
    function P2PVideoChat() {
    }
    P2PVideoChat.prototype.start = function () {
        var _this = this;
        this.handler = new HandlePeer();
        this.handler.peerOpened(function (id) {
            console.log(id);
            var idElement = document.getElementById('peerid');
            idElement.innerHTML = id;
        });
        this.handler.peerError(console.error);
        this.handler.peerCalled(this.showVideoDest);
        this.handler.peerConnected(this.receiveMessage);
        this.handler.getUserMedia(this.showVideoSelf, console.error);
        this.setVisible('connect', false);
        this.setVisible('chat', false);
        var login = document.getElementById('loginbutton');
        login.addEventListener('click', function () {
            var nameElement = document.getElementById('name');
            var name = nameElement.value;
            console.log(name);
            if (name) {
                _this.handler.setName(name);
                var namebox = document.getElementById('namebox');
                namebox.innerHTML = name;
                _this.setVisible('login', false);
                _this.setVisible('connect', true);
                _this.setVisible('chat', true);
            }
        });
        var connect = document.getElementById('connectbutton');
        connect.addEventListener('click', function () {
            var destIdElement = document.getElementById('destid');
            var destId = parseInt(destIdElement.value, 10);
            _this.handler.setDestId(destId);
            _this.handler.call(_this.showVideoDest);
            // this.handler.connect(this.receiveMessage);
            //todo 接続を失敗した場合画面の遷移を行わない
            // this.setVisible('connect', false);
            //todo 接続を受けた場合画面の遷移を行う
            _this.setVisible('chat', true);
        });
        var send = document.getElementById('sendmessage');
        send.addEventListener('click', function () {
            console.log('send');
            _this.sendMessage();
        });
        var dissconnect = document.getElementById('dissconnectbutton');
        dissconnect.addEventListener('click', function () {
            _this.handler.reset();
            _this.setVisible('login', true);
            _this.setVisible('connect', false);
            _this.setVisible('chat', false);
        });
    };
    P2PVideoChat.prototype.sendMessage = function () {
        var messageElement = document.getElementById('message');
        var message = messageElement.value;
        console.log("sendMessage: " + message);
        this.handler.connect(message);
        var list = document.getElementById('list');
        var list_item = document.createElement('li');
        var text = document.createTextNode(this.handler.getName() + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
        messageElement.value = "";
    };
    P2PVideoChat.prototype.receiveMessage = function (name, data) {
        console.log('data: ' + data);
        var message = data;
        var list = document.getElementById('list');
        var list_item = document.createElement('li');
        var text = document.createTextNode(name + ": " + message);
        list.appendChild(list_item);
        list_item.appendChild(text);
    };
    P2PVideoChat.prototype.showVideoDest = function (stream) {
        var video = document.getElementById('video-dest');
        video.src = URL.createObjectURL(stream);
    };
    P2PVideoChat.prototype.showVideoSelf = function (stream) {
        var video = document.getElementById('video-self');
        video.src = URL.createObjectURL(stream);
    };
    P2PVideoChat.prototype.setVisible = function (id, visible) {
        var element = document.getElementById(id);
        visible ? element.style.display = 'block' : element.style.display = 'none';
    };
    return P2PVideoChat;
}());
