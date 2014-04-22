var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();
var configs = require('./config/loader.js');
var port = configs.port;
var redis = require("redis").createClient();
var RedisStore = require("connect-redis")(express);

// Middleware hell
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: configs.cookieSecret,
  store: new RedisStore({
    db: configs.dbIndex,
    port: configs.redisPort,
    host: 'localhost',
    client: redis
  })
}));

app.use(express.static(__dirname + '/public'));
app.use(app.router);


/* Middlewarez */
if(process.env.NODE_ENV === "production" ) {
  var auth = express.basicAuth(configs.admin, configs.password)
} else {
  var auth = function(req,res,next){next();};
}

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/room/:id', function(req,res) {
  res.render('send');
});

var server = http.createServer(app);
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: server, chunkSize: 245760});

var Clients = function(bs) {
  var bs = bs;
  
  this.numClients = function() {
    return Object.keys(bs.clients).length;
  };

  this.clients = function() {
    return bs.clients;
  }
}

var queued = [],
		clients = clients || new Clients(bs),
		locked = false,
		broadcastComplete = false;

bs.on('connection', function(client){
	console.log('connect')
  var message = null;
  client.isTransmitting = false;

  emit({data: "numClients", clients: clients.numClients() - 1});
	checkQueue();
	
  client.on('stream', function(stream, meta){
		// a messaging stream has been opened
		if(meta.type === "message") {
			console.log('receiving message');
      client.messageStreamId = stream.id + '';
      message = client.streams[client.messageStreamId]; 

			if(clients.numClients() > 1) {
        console.log('we have multiple clients already listening, so give an accurate count');
        emit({data: "numClients", clients: clients.numClients() - 1});
      } 

      message.on('data', function(data) {
        if(data.event == 'beforeTransmit') {
					console.log(clients.numClients());
          if(queued.length === 0 && !locked && clients.numClients() >= 2) {
            message.write({data: "transmitOK"}); 
          } else {
            message.write({data: "locked"});
            queued.push(client.id);
          }
        }
      }); 
		}
		
    if(meta.type === 'transmission') {
      if(!client.isTransmitting) {
				client.isTransmitting = true; 
      	locked = true;
			}
			
      broadcast(client.id, stream, meta);

      stream.on('data',function(data) {
        stream.write({rx: data.length / meta.size});
      });

      stream.on('end',function() {
        // Once the file has been uploaded to the server, check if all
        // connected clients have finished with the stream before removing
        // the original transmitted stream
        var broadcastEnd = setInterval(function() {
          if(broadcastComplete) {
            console.log('stream ending');
            stream.destroy();
            locked = false;
            broadcastComplete = false;
            client.isTransmitting = false;
            console.log("is broadcast complete? " + !broadcastComplete); 
            console.log("Is transmission locked? " + locked);
            checkQueue();
            clearInterval(broadcastEnd);
          }
        },500);
      });
    } 

    stream.on('error',function() {
      console.log('error!');
      console.log(arguments);
    });

    stream.on('close',function() {
      console.log('stream over');
      console.log(broadcastComplete)
    });

  });
 
	client.on('close',function(code,message) {
    console.log('close called');

		if(client.isTransmitting) locked = false;
		emit({data: "numClients", clients: clients.numClients() - 1});
	});
});


// Send a message to all clients via their message channel
function emit(message) {
  var client,
      streamId;

  for(client in bs.clients) {
    streamId = bs.clients[client].messageStreamId;
    if(typeof streamId !== 'undefined') {
      bs.clients[client].streams[streamId].write(message);
    }
  }
}

// sends a stream to all clients but the originator
function broadcast(clientId, stream, meta) {
  var temporaryStream, cl, inc = 0, clientCount = clients.numClients();

  if(clientCount < 2) return false;

  for(cl in bs.clients) {
    if(clientId == cl) {
      continue;
    } else {
      console.log('broadcasting to connected clients');
      temporaryStream = bs.clients[cl].send(stream,meta);

      // when the source ends, remove our local copy
      temporaryStream.on('close', function() {
        inc++;
        if(inc === (clientCount - 1)) {
          temporaryStream.destroy();
          broadcastComplete = true;
        }
      });

      temporaryStream.on('error',function() {
        console.log('temp stream error!');
        console.log(arguments);
      });
    } 
  }
}

// If the queue is empty, do nothing, otherwise, remove the client from
// the queue and send them a message to start their stream.
function checkQueue() {
  if(queued.length === 0) return false;

  var nextClient = bs.clients[queued.splice(0,1)]

  console.log('getting next client', nextClient);

  if (!nextClient) return;
	
  nextClient.streams[nextClient.messageStreamId].write({data: 'isNext'});
	nextClient.isTransmitting = true;
	locked = true;
}

server.listen(port);
console.log('HTTP and BinaryJS server started on port %d', port);
