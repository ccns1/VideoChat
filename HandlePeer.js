"use strict";
//HandlePeer.ts
var HandlePeer = /** @class */ (function () {
    function HandlePeer() {
        this.peerId = String(Math.floor(Math.random() * 900) + 100);
        var options = {
            host: location.hostname,
            port: 9000
        };
        this.peer = new Peer(this.peerId, options);
    }
    HandlePeer.prototype.peerOpened = function (handleId) {
        console.log('open');
        this.peer.on('open', function (id) { return handleId(id); });
    };
    HandlePeer.prototype.peerError = function (errorCallbadck) {
        this.peer.on('error', function (error) { return errorCallbadck(error); });
    };
    //相手からのcallを受けた時にビデオの表示を行う
    HandlePeer.prototype.peerCalled = function (handleStream) {
        var _this = this;
        this.peer.on('call', function (call) {
            _this.destId = call.peer;
            console.log('call.peer: ' + call.peer);
            call.answer(_this.localStream);
            call.on('stream', function (stream) { handleStream(stream); });
        });
    };
    //相手からデータを受けた時にメッセージを表示する
    HandlePeer.prototype.peerConnected = function (handleData) {
        var _this = this;
        this.peer.on('connection', function (connection) {
            _this.dataConnection = connection;
            _this.destId = connection.peer;
            connection.on('data', function (data) { return handleData(connection.metadata.name, data); });
        });
    };
    //todo セッター　ゲッター
    HandlePeer.prototype.getName = function () {
        return this.name;
    };
    HandlePeer.prototype.setName = function (name) {
        this.name = name;
    };
    HandlePeer.prototype.setDestId = function (destId) {
        this.destId = destId;
    };
    HandlePeer.prototype.getDestName = function () {
        return this.dataConnection.metadata.name;
    };
    HandlePeer.prototype.getUserMedia = function (successCallbak, errorCallbadck) {
        var _this = this;
        var p = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        p.then(function (stream) {
            _this.localStream = stream;
            successCallbak(stream);
        });
        p.catch(function (error) { return errorCallbadck(error); });
    };
    //相手にコールする
    HandlePeer.prototype.call = function (handleStream) {
        console.log('this.destId' + this.destId);
        var call = this.peer.call(this.destId, this.localStream);
        call.on('stream', function (stream) { return handleStream(stream); });
    };
    //相手にコネクションを送信する
    HandlePeer.prototype.connect = function (message) {
        var _this = this;
        this.dataConnection = this.peer.connect(this.destId, {
            metadata: {
                'name': this.name
            }
        });
        this.dataConnection.on('open', function () {
            _this.dataConnection.send(message);
        });
    };
    HandlePeer.prototype.reset = function () {
        //todo localStreamのリセット確認
        this.localStream.getVideoTracks()[0].stop();
        this.localStream.getAudioTracks()[0].stop();
        this.localStream = null;
        this.peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
        this.peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
    };
    return HandlePeer;
}());
