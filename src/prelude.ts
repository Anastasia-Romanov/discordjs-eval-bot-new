import { stripIndent } from 'common-tags';

const prelude = stripIndent`
  const { client, message, args, flags, prefix, compileEval } = arguments[4];

  import * as assert from 'node:assert/strict';
  import * as async_hooks from 'node:async_hooks';
  import * as buffer from 'node:buffer';
  import * as child_process from 'node:child_process';
  import * as cluster from 'node:cluster';
  import * as crypto from 'node:crypto';
  import diagnostics_channel from 'node:diagnostics_channel';
  import * as dns from 'node:dns';
  import * as domain from 'node:domain';
  import * as events from 'node:events';
  import * as fs from 'node:fs';
  import * as fsp from 'node:fs/promises';
  import * as http from 'node:http';
  import * as http2 from 'node:http2';
  import * as https from 'node:https';
  import * as inspector from 'node:inspector';
  import * as module from 'node:module';
  import * as net from 'node:net';
  import * as os from 'node:os';
  import * as path from 'node:path';
  import * as perf_hooks from 'node:perf_hooks';
  import * as process from 'node:process';
  import * as punycode from 'node:punycode';
  import * as querystring from 'node:querystring';
  import * as readline from 'node:readline';
  import * as repl from 'node:repl';
  import * as stream from 'node:stream';
  import { StringDecoder } from 'node:string_decoder';
  import * as timers from 'node:timers';
  import { setTimeout as sleep, setInterval as every, scheduler } from 'node:timers/promises';
  import * as tls from 'node:tls';
  import * as tty from 'node:tty';
  import * as dgram from 'node:dgram';
  import { URL, URLSearchParams } from 'node:url';
  import * as util from 'node:util';
  import * as v8 from 'node:v8';
  import * as vm from 'node:vm';
  import * as webstream from 'node:stream/web';
  import * as threads from 'node:worker_threads';
  import * as zlib from 'node:zlib';

  import * as helpers from './helpers';

  const webcrypto = crypto.webcrypto;

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
`;

export default prelude;
