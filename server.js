var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();
var configs = require('./config/loader.js');
var port = configs.port;
var redis = require("redis").createClient(configs.redisPort);
var RedisStore = require("connect-redis")(express);


//--------------------------------------------------------------//
// Middleware hell
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Parse form data
app.use(express.bodyParser());
app.use(express.cookieParser());

// Store sessions within redis.
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

app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.flash = function() {
    return req.flash()
  };
  next();
});

app.use(app.router);

/* Middlewarez */
if(process.env.NODE_ENV === "production" ) {
  // Lock version on server with basic auth
  var auth = express.basicAuth(configs.admin, configs.password)
} else {
  // register auth as a no-op for local environments
  var auth = function(req,res,next){
    next();
  };
}
//--------------------------------------------------------------//

// Handler to load the splash index. Could probably be genericized/merged with
// the 'send' endpoint
app.get('/', function(req, res) {
  var flashes = res.locals.flash();
  res.render('index', {
    messages: flashes,
    env: configs.env
  });
});

// Endpoint to allow user to create a unique room id to share.
// TODO move code generation to the server? Doesnt really matter what the code
// is I suppose.
app.post('/guid', function(req, res) {
  var code = req.body.accessCode

  if (typeof code === "undefined") {
    return res.send(400, {
      error: "Invalid access code."
    });
  }

  redis.select(configs.dbIndex, function(err) {
    // Access guids are stored for one hour.
    redis.setex(code, 3600, true, function(err) {
      if (err) {
        // Error setting a redis key. Let the user know.
        return res.send(500, {
          error: err
        });
      }

      res.send(200, {
        code: code
      });
    });
  });
});

// Send user to the requested 'room'.
// TODO: why am i passing the env.
app.get('/room/:id', roomExists, function(req,res) {
  res.render('send', {
    env: configs.env
  });
});

var server = http.createServer(app);
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: server, chunkSize: 245760});

var Clients = function(bs) {
  var bs = bs;

  // Get count of clients in a given room?
  this.length = function() {
    return Object.keys(bs.clients).length;
  };

  this.clients = function() {
    return bs.clients;
  }
}

// Global list of all clients queued for transmission
var queued = [];
// very very simple wrapper for the binary server clients dictionary
var clients = clients || new Clients(bs);
// Server is free to allow a user to transmit content to others.
var locked = false;
var broadcastComplete = false;

bs.on('connection', function(client) {
	console.log('connect');

  var message = null;
  client.isTransmitting = false;

  emit({
    data: 'numClients',
    clients: clients.length()
  });

	checkQueue();

  client.on('stream', function(stream, meta) {
		// a messaging stream has been opened
		if (meta.type === 'message') {
			console.log('receiving message, stream id: ', stream.id);
      // WTODO hy am i casting this to a string
      client.messageStreamId = stream.id + '';
      message = client.streams[client.messageStreamId];

			if(clients.length() > 1) {
        // We want each person to know how many people other than themselves are
        // connected, so subtract one from the number of connected clients.
        emit({
          data: "numClients",
          clients: clients.length()
        });
      }

      message.on('data', function(data) {
        if (data.event == 'beforeTransmit') {
					console.log('Data received. Connected client:', clients.length());
          // No clients in the queue, no client is transmitting, and there is
          // more than one connected client
          if (!queued.length && !locked && clients.length() >= 2) {
            // This client is ok to begin streaming
            message.write({
              data: 'transmitOK'
            });
          } else {
            // Someone is already streaming, so queue up this client's request
            message.write({
              data: 'locked'
            });
            queued.push(client.id);
          }
        }
      });
		}

    if (meta.type === 'transmission') {
      if (!client.isTransmitting) {
				client.isTransmitting = true;
      	locked = true;
			}

      broadcast(client.id, stream, meta);

      stream.on('data', function(data) {
        stream.write({
          rx: data.length / meta.size
        });
      });

      stream.on('end',function() {
        /*
         * Once the file has been streamed to the server, check if all
         * connected clients have finished with the stream before removing it.
        */
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
        }, 500);
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

  /**
   * handler called when client disconnects. Emits updated count of commencted
   * cients.
   * @param  {String} 'close'        event being handled
   * @param  {Function}              callback passed two arguments, an internal
   *                                 code and an optional message
   * @return {Undefined}             _
   */
	client.on('close',function(code, message) {
    console.log('close called', code, message);

		if (client.isTransmitting) {
      locked = false;
    }

		emit({
      data: "numClients",
      clients: clients.length()
    });
	});
});


// Send a message to all clients via their message channel.
function emit(message) {
  var client;
  var streamId;

  for (client in bs.clients) {
    streamId = bs.clients[client].messageStreamId;

    if (typeof streamId !== 'undefined') {
      bs.clients[client].streams[streamId].write(message);
    }
  }
}

// sends a stream to all clients but the originator
function broadcast(clientId, stream, meta) {
  var temporaryStream;
  var inc = 0;
  var clientCount = clients.length();

  // Don't broadcast if there is a single client connected.
  if (clientCount < 2) {
    return false;
  }

  // Loops through all the clients in the client dictionary
  for (client in bs.clients) {
    // skip the broadcasting client, they don't need to receive messages
    if (clientId == client) {
      continue;
    } else {
      console.log('broadcasting to connected clients');

      // Seems like every client is getting their own stream.
      // Would it be possible to share a single stream between all clients?
      // This would make it impossible for a client to join midstream and
      //
      // TODO: Send a message to the broadcaster to let them know when a stream
      // has completed, that way they can know well all connected clients have
      // received the file.
      temporaryStream = bs.clients[client].send(stream, meta);

      // when the source file finishes streaming,
      // flush the stream.
      temporaryStream.on('close', function() {
        // Each user closes their own stream, so increment the completed stream
        // counter and clean it up.
        inc++;
        if(inc === (clientCount - 1)) {
          // All client streams have finished, destroy the stream.
          temporaryStream.destroy();
          broadcastComplete = true;
        }
      });

      temporaryStream.on('error',function() {
        console.log('temp stream error!');
        console.log(arguments);
        // Cleanup the stream on error as well.
        // TODO this might cause errors. Look into testing this.
        // temporaryStream.destroy();
        // broadcastComplete = true;
      });
    }
  }
}

// If the queue is empty, do nothing, otherwise, remove the client from
// the queue and send them a message to start their stream.
function checkQueue() {
  // Queue is empty, return.
  if (queued.length === 0) {
    return false;
  }

  // Get the next client off the FIFO queue. Looks up that client in
  // our dictionary of clients.
  var nextClient = bs.clients[queued.splice(0,1)];

  console.log('getting next client', nextClient);

  // Next client not found in the dictionary, return.
  if (!nextClient) {
    return false;
  }

  nextClient.streams[nextClient.messageStreamId].write({data: 'isNext'});
  // flip client's state to transmitting
  nextClient.isTransmitting = true;
  // lock transmissions, no new clients may start transmitting at this time.
	locked = true;
}

/**
 * Middleware
 * Ensure that the room being requested by the user is keyed in redis.
 */
function roomExists(req, res, next) {
  var roomId = req.params.id;

  redis.select(configs.dbIndex, function(err) {
    if (err) {
      return next(err);
    }

    redis.get(roomId, function(err, val) {
      // An error occured while attempting to access redis.
      if (err) {
        return next(err);
      }

      if (val === null) {
        req.flash('error', 'Room not found. Generate a new code below.');
        return res.redirect('/')
      } else {
        next();
      }
    });
  });
}

server.listen(port);
console.log('HTTP and BinaryJS server started on port %d', port);
