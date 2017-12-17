//P2PServer_only.ts
var PeerServer = require('peer').PeerServer;
var server = new PeerServer( { port: 9000} );

console.log('9000番ポートでシグナリングサーバーが起動');
