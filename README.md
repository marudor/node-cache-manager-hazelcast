# Node Cache Manager store for Hazelcast
A [Hazelcast](http://github.com/brianc/node-postgres) store for the [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) module.
### Installation

```
npm install --save cache-manager-hazelcast
```

### Usage examples
```javascript
var cacheManager = require('cache-manager');
var hazelcastStore = require('cache-manager-hazelcast');

var hazelcastCache = cacheManager.caching({
  store: hazelcastStore,
  defaultMap: 'CACHE' // Default Value is 'CACHE'
  host: 'localhost',
  port: 5701,
  prefix: 'MapPrefix',
  ttl: 60,
});

hazelcastCache.set('foo', 'bar', {
  mapName: 'CustomMapName',
  ttl: 120,
}); // returns Promise

hazelcastCache.get('foo', {
  mapName: 'CustomMapName',
}) // returns Promise

hazelcastCache.del('foo', {
  mapName: 'CustomMapName',
}) // returns Promise
```

### API
###### constructor Options
```javascript
{
  defaultMap?: string,
  host?: string,
  port?: string,
  prefix?: string,
  ttl?: number,
}
```
###### General Options
```javascript
{
  mapName?: string,
}
```
###### Set options
```javascript
{
  mapName?: string,
  ttl?: number,
}
```
