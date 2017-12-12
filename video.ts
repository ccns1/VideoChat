// video.ts
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

window.onload = () => {
    const device = { audio: true, video: true };
    navigator.getUserMedia(device,
        (mediaStream) => {
            document.getElementsByTagName('video')[0].src = URL.createObjectURL(mediaStream);
        },
        (err) => { console.log('Error: ' + err) }
    );
}