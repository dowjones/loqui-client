
![Loqui](/loqui.png)

# NAME
loqui-client(1), loqui-client(3)

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


# PERFORMANCE
Benchmarks are run using [`benchmark.js`][7] and contrasted using the popular 
logging library `Winston`.

Logging with blocking writes to stdout
```js
[ 'Loqui x 962 ops/sec ±3.20% (80 runs sampled)',
  'Winston x 950 ops/sec ±3.26% (50 runs sampled)',
  'Loqui-QueueSize x 85,084 ops/sec ±2.73% (81 runs sampled)']
```

Default settings without writing to `stdout`
```js
[ 'Loqui x 91,373 ops/sec ±13.17% (16 runs sampled)',
 'Winston x 15,351 ops/sec ±8.69% (52 runs sampled)',
 'Loqui-Queued x 291,271 ops/sec ±6.32% (69 runs sampled)' ]
```

Same as above test but forcing a minimum of 50 samples
```js
[ 'Loqui x 50,636 ops/sec ±19.98% (53 runs sampled)',
 'Winston x 4,749 ops/sec ±18.67% (76 runs sampled)',
 'Loqui-Queued x 137,978 ops/sec ±21.95% (83 runs sampled)' ]
```

## Setup
```bash
$npm install loqui-client loqui-server
```

1. Add the module to your program. Logged data can be queued until the number of 
logging operations equals `queueSize`. When they are streamed to disk the queue 
is flushed. When an error is logged, it is written to the disk immediately.

```js
var loqui = require('loqui-client');
var logger = loqui.createClient({ queueSize: 10 });
```

2. Define list of servers that your client will connect to in a json file
```json
[
  { "port": 9960, "host": "127.0.0.2", },
  { "port": 9968, "host": "127.0.0.1", },
  { "port": 9020, "host": "127.0.0.3", },
  { "port": 9967, "host": "127.0.0.1", }
]
```

Start the client to establish a connection to an available [`loqui-server(1)`][0].
```bash
$loqui-client --servers ./servers.json
```

3. Start the server before or after you start the client. If the server goes 
down the client will attempt to reconnect to it. If it cant, it will attempt to 
connect to others.
```bash
$loqui-server --port 9099
```

## Logging functions
Logs are key/value pairs that are designed for later lookup.

```js
logger.log('somevalue');            // Logs an entry with a unique key (uuid v4).
logger.log('somekey', 'somevalue'); // Logs an entry with a specific key.
```

## Formatting
Works like console.log. If the first argument has tokens, it will be considered
a value. The key for the following log would be a uuid that might look something
like this `56f4c507-5cd9-430b-89dd-7b2dfa1075d2`.

```js
logger.log('Felix has %d pet %s', 20, 'squirrels');
```

Here the key is `Issac` and the value will be `1 pet cat`.
```js
logger.log('Isaac', '%d pet %s', 1, 'cat');
```

# CLI OPTIONS
The `loqui-client` executable accepts the following command line parameters.

### `--servers`
A JSON file containing an array of objects. Each object contains a port and a
host.
```json
[
  { "port": 9960, "host": "127.0.0.2", }, 
  { "port": 9968, "host": "127.0.0.1", }
]
```

### `--reconnectTime`
Milliseconds to wait before attempting to reconnect.

### `--connectTimeout`
How long before calling it quits on a single connection attempt.


# API

## loqui.createClient([options])
Returns an instance of the logging client and accepts an object literal for
configuration values.

### [options] `{ queueSize: <Number> }`
The maximum number of logging operations to be queued before they are streamed
to the disk.

### [options] `{ throttle: <Number> }`
The maximum number of logging operations that can be executed within a given 
amount of time. If a throttle is provided, then a window must be provided.

### [options] `{ window: <Number> }`
The window of time (in milliseconds) that logging operations may occur.

## logger.log([key], data)
A regular priority log, should be queued for a batch streamed to the disk.

#### `key`
An optional key that can be used to look up the log data.

#### `data`
A valid JSON value.

## logger.error([key], data)
A high priority log, should be streamed to the disk immediately.

#### `key`
An optional key that can be used to look up the log data.

#### `data`
A valid JSON value.

## logger.counter(key, { counter: <n> })

#### `key`
The key will be looked up on the server and the value that is retrieved will
be used as a base from which the increment from.

#### `n`
A positive or negative value for which to increment or decrement the existing 
value's `counter` member.

## logger.extend(key, value)

#### `key`
The key will be looked up on the server and the value that is retrieved will
be used as a base from which the extend from.

#### `value`
A value that should be extended. For instance adding `{ a: 1 }` to an existing
value of `{ b: 2 }` would produce `{ a: 1, b: 2 }`.

# SEE ALSO
[`loqui-server(1)`][0]

[0]:https://github.com/dowjones/loqui-server
[1]:http://dtrace.org/blogs/about/
[2]:http://smartos.org/
[3]:https://github.com/dtrace4linux/linux
[4]:http://www.linfo.org/rule_of_silence.html
[5]:https://github.com/isaacs/npmlog
[6]:http://jsperf.com/nooplogging
