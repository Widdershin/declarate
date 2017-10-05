# declarate

> Turn imperative APIs into declarative APIs!

Imperative APIs can be a pain to work with. A clear example is the DOM API. It has imperative commands like `createElement`, `appendChild` and `removeElement`.

In recent years, it has been recognized that interacting with the imperative DOM API is a significant source of complexity in our applications.

So instead, we use declarative interfaces like React and virtual-dom. This allows us to describe what state we should be in, and allow our underlying technology to call the right imperative methods to transition to that state.

`declarate` is a library for wrapping imperative APIs so that they can be used declaratively.


Let's say we want to interact with the Leaflet API:

## Usage

```js
var declarate = require('declarate')

const config = {
  resources: {
    marker: (data) => {
      return {
        create: () => {
        
        }
      }
    }
  }
}

const {marker, patch} = declarate(config);

const firstState = {
  markers: [
    marker(1, [50.5, 30.5]),
    marker(2, [50.5, 35.5])
  ]
}

patch(firstState);

// Calls
//  markers[1] = Leaflet.marker([50.5, 30.5]);
//  map.addLayer(markers[1]);
//  markers[2] = Leaflet.marker([50.5, 35.5]);
//  map.addLayer(markers[2]);

const secondState = {
  markers: [
    marker(2, [50.5, 35.5])
    marker(3, [50.5, 30.3])
  ]
}

// Calls
//  map.removeLayer(markers[1]);
//  delete markers[1];
//  markers[3] = Leaflet.marker([50.5, 30.3]);
//  map.addLayer(markers[3]);
```

outputs

```
hello warld
```

## API

```js
var declarate = require('declarate')
```

See [api_formatting.md](api_formatting.md) for tips.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install declarate
```

## Acknowledgments

declarate was inspired by..

## See Also

- [`noffle/common-readme`](https://github.com/noffle/common-readme)
- ...

## License

ISC

