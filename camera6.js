// camera6.js
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia); //Chrome, Firefox, msへの対応のためのprefix設定

function start() 　{
  function $(id) { return document.getElementById(id); }
  var localStream; //自端末のカメラ・マイクから取得したstream
  var dataConnection; //テキストチャット　データ接続用
  var canvasStream; // canvasのstream

  $("start").onclick = function () {
    navigator.getUserMedia(
      { 'video': true, 'audio': true },
      function (stream) {
        var myVideo = $("myVideo");
        myVideo.srcObject = stream;
        localStream = stream;
      },
      function (error) { alert('error: ' + error); }
    );
  };

  //Peerオブジェクトの生成　他のpeerへ接続する、他のpeerからのコネクションをlistenする
  var peerId = String(Math.floor(Math.random() * 9000 + 1000)); //自端末のIdを作成
  var options = {
    host: "knak-lab.ihc.kanazawa-it.ac.jp",
    port: "9000",
    secure: true,
    debug: 3
  };
  var peer = new Peer(peerId, options); // 自端末のidを指定しシグナリングサーバへの接続しPeerオブジェクト作成
  peer.on('open', function (id) {
    $("peerId").innerHTML = id; // 自端末のid
    $("text_peerId").innerHTML = id; // 自端末のid
  });
  peer.on('error', function (error) { alert('error: ' + error) });

  //canvas用Peerオブジェクトの生成　他のpeerへ接続する、他のpeerからのコネクションをlistenする
  var peerIdCanvas = String(Math.floor(Math.random() * 9000 + 1000)); //自端末のIdを作成
  var options = {
    host: "knak-lab.ihc.kanazawa-it.ac.jp",
    port: "9000",
    secure: true,
    debug: 3
  };
  var peerCanvas = new Peer(peerIdCanvas, options); // 自端末のidを指定しシグナリングサーバへの接続しPeerオブジェクト作成
  peerCanvas.on('open', function (id) {
    $("canvas_peerId").innerHTML = id; // 自端末のid
  });
  peerCanvas.on('error', function (error) { alert('error: ' + error) });

  //相手からビデオチャットのコールを受けたときの処理
  peer.on('call', function (call) {
    var callId = call.peer; //ビデオ通話がかかってきた相手のid
    $("callId").innerHTML = callId;
    call.answer(localStream); // 相手からのcallに対するアンサー
    call.on('stream', function (stream) { //イベントリスナを設定。stream型イベントが発火したら、コールバック関数内で相手から送られてくるstreamを表示
      var destVideo = $("yourVideo"); //HTMLでの表示場所を設定
      destVideo.srcObject = stream; //相手のstremを表示先に設定
    });
  });

  //相手へビデオチャットのコールをするときの処理
  $("send_btn").onclick = function () {
    var destPeerId = $('number').value;
    var call = peer.call(destPeerId, localStream); //相手のidを指定して、メディアストリームを送る
    call.on('stream', function (stream) { //相手からのcallを待つ stream型イベントが発火したら、コールバック関数内で相手から送られてくるstreamを表示
      var destVideo = $("yourVideo");
      destVideo.srcObject = stream; //相手のstreamを表示先に設定
    });
    $("callId").innerHTML = destPeerId;
  };

  //相手からCanvasチャットのコールを受けたときの処理
  peerCanvas.on('call', function (call) {
    var callId = call.peer; //ビデオ通話がかかってきた相手のid
    $("canvas_callId").innerHTML = callId;
    call.answer(canvasStream); // 相手からのcallに対するアンサー
    call.on('stream', function (stream) { //イベントリスナを設定。stream型イベントが発火したら、コールバック関数内で相手から送られてくるstreamを表示
      var destVideo = $("yourCanvasVideo"); //HTMLでの表示場所を設定
      destVideo.srcObject = stream; //相手のstremを表示先に設定
    });
  });

  //相手へCanvasチャットのコールをするときの処理
  $("send_canvas_btn").onclick = function () {
    var destPeerId = $('canvas_number').value;
    var call = peerCanvas.call(destPeerId, canvasStream);
    call.on('stream', function (stream) { //相手からのcallを待つ stream型イベントが発火したら、コールバック関数内で相手から送られてくるstreamを表示
      var destVideo = $("yourCanvasVideo");
      destVideo.srcObject = stream; //相手のstreamを表示先に設定
    });
    $("canvas_callId").innerHTML = destPeerId;
  };

  //相手からテキストチャットのコールを受けたときの処理
  peer.on('connection', function (connection) {
    dataConnection = connection;
    dataConnection.on("open", function () {
      $("text_callId").innerHTML = dataConnection.peer;
    });
    dataConnection.on("data", onRecvMessage);
  });

  // 相手へテキストチャットのコールをするときの処理
  $("send_text_btn").onclick = function () {
    var destPeerId = $('text_number').value;
    dataConnection = peer.connect(destPeerId);
    dataConnection.on('open', function () {
      $("text_callId").innerHTML = dataConnection.peer;
    });
    dataConnection.on('data', onRecvMessage);
  };

  // メッセージ受信
  function onRecvMessage(data) {
    var callId = dataConnection.peer;
    var chat = $("chat");
    var list = document.createElement('li');
    var text = document.createTextNode(callId + ": " + data);
    chat.appendChild(list);
    list.appendChild(text);
  }

  // メッセージ送信
  $("textSend").onclick = function () {
    var messagehtml = $("message");
    var message = messagehtml.value;
    dataConnection.send(message);
    // 自端末のウィンドにメッセージ表示
    var chat = $("chat");
    var list = document.createElement('li');
    var text = document.createTextNode(peer.id + ": " + message);
    chat.appendChild(list);
    list.appendChild(text);
    // 送信テキストボックスをクリア
    var messagetext = $("message");
    messagetext.value = ("");
  };

  //canvasにマウス描画
  var picCanvas = $("picCanvas");//お絵かき用のcanvas
  var picCanvasContext = picCanvas.getContext('2d');
  var myCanvasVideo = $('myCanvasVideo');
  var x = 0;
  var y = 0;
  draw = false;
  //マウスムーブでマウス座標取得
  picCanvas.addEventListener("mousemove", function (event) {
    var rect = event.target.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
    //描画
    if (draw === true) {
      picCanvasContext.fillStyle = "red";
      picCanvasContext.beginPath();
      picCanvasContext.arc(x, y, 10, 0, 2 * Math.PI, false);
      picCanvasContext.fill();
    }
  });
  //マウスダウンで描画可能
  picCanvas.addEventListener("mousedown", function (e) {
    draw = true;
  });
  //マウスアップで描画終了
  picCanvas.addEventListener("mouseup", function (e) {
    draw = false;
  });  //canvasお絵かきここまで

  // Canvasに描いた絵をストリームにする
  function captureCanvas() {
    canvasStream = picCanvas.captureStream();//canvasに描画した絵をストリームにする
    var myCanvasVideo = $("myCanvasVideo");
    myCanvasVideo.srcObject = canvasStream;
  };
  captureCanvas();

  //終了時の処理
  $("callEnd").onclick = function () {
    localStream.getVideoTracks()[0].stop();
    localStream.getAudioTracks()[0].stop();
    localStream = null;
    canvasStream.getVideoTracks()[0].stop();
    canvasStream = null;
    peer.disconnect(); //サーバとのの接続をクローズし、既存の接続はそのまま
    peerCanvas.disconnect();
    peer.destroy(); //サーバとのの接続をクローズし、すべての既存の接続を終了する
    peerCanvas.destroy();
  };
};
