function setDifference(a, b) {
  const differences = [];

  a.forEach(value => {
    if (!b.has(value)) {
      differences.push(value);
    }
  });

  return differences;
}

function diff (oldState, newState) {
  const resources = Object.keys(newState);
  const differences = [];

  resources.forEach(resource => {
    const oldIds = new Set();
    const oldItemsById = {};
    const newIds = new Set();
    const newItemsById = {};

    oldState[resource].forEach(item => {
      oldIds.add(item.id);
      oldItemsById[item.id] = item;
    });

    newState[resource].forEach(item => {
      newIds.add(item.id);
      newItemsById[item.id] = item;
    });

    const removedIds = setDifference(oldIds, newIds);
    const addedIds = setDifference(newIds, oldIds);

    removedIds.forEach(id => {
      differences.push({type: 'remove', resource, id});
    });

    addedIds.forEach(id => {
      differences.push({type: 'add', resource, args: newItemsById[id]});
    });
  });

  return differences;
}

export function declarate(cfg: any, map: any) {
  let oldState = {markers: []};
  const markers: any[] = [];
  const resourceCache = {markers: {}};

  const patch = function (state: any) {
    const differences = diff(oldState, state);

    differences.forEach(difference => {
      if (difference.type === 'add') {
        const marker = cfg[difference.resource].create(map, difference.args);

        resourceCache.markers[difference.args.id] = marker;

        cfg.markers.attach(map, marker);
      } else if (difference.type === 'remove') {
        cfg[difference.resource].remove(
          map,
          resourceCache[difference.resource][difference.id]
        );

        delete resourceCache[difference.resource][difference.id];
      } else {
        throw new Error(`Unimplemented type: ${difference.type}`);
      }
    });

    oldState = state;
  }

  return {
    marker: (id: number, latLng: any) => ({id, latLng}),
    patch
  }
}

