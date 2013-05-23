
![Loqui](/loqui.png)

# NAME
loqui-client(3)

# SYNOPSIS
A modern application logger.

# MOTIVATION & DESIGN GOALS

 - Sensitivity to the cost of I/O. The frequency at which a logger writes can 
 be a root cause for poor performance in an application.
 - Burden of the application with as few moving parts as possible.
 - Simplify transportation to a single protocol and use a log server as a proxy
 to redistribute and transform data. This is more fault tolerant and more 
 practical especially for distributed systems.
 - Intended to be used in an architecture where there are many clients to many 
 servers.
 - Streaming.

# SCOPE
The purpose of application logging is to capture interesting data points that 
occur during the lifetime of an application.

Because application loggers have side effects, they are not a viable means of
performance profiling. For performance profiling you should use [`dtrace`][1],
dtrace runs on [`SmartOS`][2], Darwin (MacOS) and [`Linux`][3].

Furthermore, application logging should not be conflated with debugging. Writing
to `process.stdout` will block the process incurring a performance penalty. If 
you want to make [`fancy output`][4] to the console consider [`this`][5] library.

Many loggers provide levels to determine when to log. For instance, a logging 
operation like `log.debug('foo')` will simply become a no-op if the current 
logging level does not include `debug`. No-ops incur unnecessary 
[`performance overhead`][6]. Debugging should be handled with the console object
and removed when no longer needed. Log levels are an anti-pattern, they conflate
debugging, profiling and application logging.

# EXAMPLES
Logged data can be queued until the number of logging operations equals
`queueSize`. When they are streamed to the server the queue is flushed.
When an error is logged, it is written to the server immediately.

## Setup
Create a client and establish a connection to the logging server. The
`createClient` method yields a socket that is connected to the server.
It accepts an object literal with various configuration options.

```js
var loqui = require('loqui-client');

var logger = loqui.createClient({ queueSize: 10 });
```

## Logging functions
The logger object is a writable stream and has all the logging functions
attached to it.

## Simple logging and key/value logging for later lookup.
Queues a log to be sent to the server and written locally to the cache.

```js
logger.log('somevalue'); // Logs an entry with no key.
logger.log('somekey', 'somevalue'); // Logs an entry with a key.
```

## Formatting
formatting is handled just like console.log. the first argument can still be a 
key that can be queried on the server from another service.

```js
logger.log('Felix has %d pet %s', 20, 'squirrels');
logger.log('Isaac', '%d pet %s', 1, 'cat');
```

# API

## loqui.createClient(options)
Returns a logging client and accepts an object literal for configuration values. 
All of the following options are optional.

#### `{ queueSize: <Number> }`
The maximum number of logging operations to be queued before they are sent to 
the server or committed to the cache.

#### `{ throttle: <Number> }`
The maximum number of logging operations that can be executed within a given 
amount of time. If a throttle is provided, then a window must be provided.

#### `{ window: <Number> }`
The window of time (in milliseconds) that logging operations may occur.

#### `{ servers: <Object> }`
An array that contains a list of  servers. Each array in the array should 
contain a port and host address.

#### `{ reconnectTime: <Number> }`
Milliseconds to wait before attempting to reconnect.

#### `callback`
Called once the connection to the server has closed.

## logger.log([key], data)
A regular priority log, should be queued for a batch send to the server.

#### `key`
An optional key that can be used to look up the log data with `client.get(key)`.

#### `data`
A valid JSON value.

## logger.error([key], data)
A high priority log, should be sent to the server immediately.

#### `key`
An optional key that can be used to look up the log data with `client.get(key)`.

#### `data`
A valid JSON value.

## logger.counter(key, { counter: <n> })

#### `key`
The key will be looked up on the server and the value that is retrieved will
be used as a base from which the increment from.

#### `n`
A positive or negative value for which to increment or decrement the existing 
value's `counter` member.

# SEE ALSO
[`loqui-server(3)`][0]

[0]:https://github.com/dowjones/loqui-server
[1]:http://dtrace.org/blogs/about/
[2]:http://smartos.org/
[3]:https://github.com/dtrace4linux/linux
[4]:http://www.linfo.org/rule_of_silence.html
[5]:https://github.com/isaacs/npmlog
[6]:http://jsperf.com/nooplogging
