// @flow
import { Address, Config, Client } from 'marudor-hazelcast-client';
import type { IMap } from 'marudor-hazelcast-client';

export type HazelcastGetOptions = {
  mapName?: string,
}

export type HazelcastSetOptions = {
  ttl?: number,
} & HazelcastGetOptions;

type storeConfig = {
  host?: string,
  port?: string,
  prefix?: string,
};

export default class HazelcastStore {
  name: string = 'hazelcast';
  usePromises: bool = true;
  defaultMap: string = 'CACHE';
  client: Client;
  prefix: ?string;
  args: storeConfig;

  constructor(args?: storeConfig = {}) {
    this.args = args;
    this.createClient(args);
    this.prefix = args.prefix;
  }
  createClient(args: storeConfig) {
    const cfg = new Config.ClientConfig();
    const networkCfg = new Config.ClientNetworkConfig();
    networkCfg.addresses = [new Address(args.host, args.port ? Number.parseInt(args.port, 10) : undefined)];
    cfg.networkConfig = networkCfg;
    cfg.properties['hazelcast.logging'] = 'off';
    return Client.newHazelcastClient(cfg).then(client => {
      this.client = client;
    });
  }
  mapName(map?: string) {
    return `${this.prefix ? `${this.prefix}_` : ''}${map || this.defaultMap}`;
  }
  map(map?: string): IMap<string, mixed> {
    return this.client.getMap(this.mapName(map));
  }
  _tryCatchRestart(fn: Function): Promise {
    return fn()
    .catch(e => {
      if (e.code === 'EPIPE') {
        return this.createClient(this.args)
        .then(() => fn());
      }
    });
  }
  setPromise(key: string, value: mixed, options: HazelcastSetOptions = {}) {
    return this._tryCatchRestart(() => this.map(options.mapName).put(key, value, options.ttl));
  }
  set(key: string, value: mixed, options: HazelcastSetOptions = {}, cb: Function) {
    this.setPromise(key, value, options)
    .then(val => cb(undefined, val))
    .catch(err => cb(err));
  }
  getPromise(key: string, options: HazelcastGetOptions = {}) {
    return this._tryCatchRestart(() => this.map(options.mapName).get(key)
      .then(raw => {
        try {
          return JSON.parse((raw: any));
        } catch (e) {
          return raw;
        }
      })
    );
  }
  get(key: string, options: HazelcastGetOptions = {}, cb: Function) {
    this.getPromise(key, options)
    .then(val => cb(undefined, val))
    .catch(err => cb(err));
  }
  delPromise(key: string, options?: HazelcastGetOptions = {}) {
    return this._tryCatchRestart(() => this.map(options.mapName).delete(key));
  }
  del(key: string, options: HazelcastGetOptions = {}, cb: Function) {
    this.delPromise(key, options)
    .then(val => cb(undefined, val))
    .catch(err => cb(err));
  }
  resetPromise(options?: HazelcastGetOptions = {}) {
    return this._tryCatchRestart(() => this.map(options.mapName).clear());
  }
  reset(options: HazelcastGetOptions = {}, cb: Function) {
    this.resetPromise(options)
    .then(val => cb(undefined, val))
    .catch(err => cb(err));
  }
  keysPromise(options?: HazelcastGetOptions = {}) {
    return this._tryCatchRestart(() => this.map(options.mapName).keySet());
  }
  keys(options: HazelcastGetOptions = {}, cb: Function) {
    this.keysPromise(options)
    .then(val => cb(undefined, val))
    .catch(err => cb(err));
  }
}
