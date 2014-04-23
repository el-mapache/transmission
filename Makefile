start:
	mkdir -p logs
	NODE_ENV=$(env) forever start -a -l forever.log -o logs/out.log -e logs/error.log --minUpTime 5000 --spinSleepTime 2000 `pwd`/server.js

stop:
	forever stop `pwd`/server.js

restart:
	stop
	start

build:
	node ./public/r.js -o ./public/app.build.js

