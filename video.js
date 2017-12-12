// video.ts
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.onload = function () {
    var device = { audio: true, video: true };
    navigator.getUserMedia(device, function (mediaStream) {
        document.getElementsByTagName('video')[0].src = URL.createObjectURL(mediaStream);
    }, function (err) { console.log('Error: ' + err); });
};
