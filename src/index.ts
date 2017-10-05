

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
  // given an old state and a new state
  // where the state is an object of resources
  //
  //for each resource
  // create a set of ids for old state and new state
  //  take the items in the old state, but not in the new state and remove them
  //  take the items in the new state, but not in the old state and add them
  //  for the remaining items, check if the old state is equal to the new state
  //  if not, update

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
  const markers: any[] = [];
  let oldState = {markers: []};
  const resourceCache = {markers: {}};

  const patch = function (state: any) {
    const improved = true;
    if (improved) {
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
        } else {
          throw new Error(`Unimplemented type: ${difference.type}`);
        }
      });

      oldState = state;
    } else {
      while (markers.length > 0) {
        cfg.markers.remove(map, markers.pop());
      }

      state.markers.forEach((markerData: any) => {
        const marker = cfg.markers.create(map, markerData);

        markers.push(marker);

        map.addLayer(marker);
      })
    }
  }

  return {
    marker: (id: number, latLng: any) => ({id, latLng}),
    patch
  }
}

