start:
	mkdir -p logs
	forever start -a -l forever.log -o logs/out.log -e logs/error.log --minUpTime 5000 --spinSleepTime 2000 pwd/server.js

stop:
	forver stop pwd/server.js

restart:
	stop
	start
