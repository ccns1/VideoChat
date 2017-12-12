//P2PServer.ts
var http = require('http');
var static = require('node-static');

var file = new static.Server('.');

http.createServer(function(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
}).listen(8888);

console.log('8888番ポートでWebサーバーが起動');

var PeerServer = require('peer').PeerServer;
var server = new PeerServer( { port: 9000} );

console.log('9000番ポートでシグナリングサーバーが起動');
