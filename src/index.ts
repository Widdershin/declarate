const neverRecreate = () => false;

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set();

  a.forEach(value => {
    if (!b.has(value)) {
      result.add(value);
    }
  });

  return result;
}

export interface Config<Root, Props extends HasID, Actual> {
  create(root: Root, props: Props): Actual;
  attach(root: Root, actual: Actual): void;
  remove(root: Root, actual: Actual): void;
  shouldRecreate?: (oldProps: Props, newProps: Props) => boolean;

  attributes: {
    [K in keyof Partial<Props>]: DiffPatch<Root, Props, Actual, Props[K]>
  };
}

interface DiffPatch<Root, Props, Actual, Value> {
  diff(a: Value, b: Value): boolean;
  patch(r: Root, p: Props, a: Actual, v: Value): void;
}

type Patch<Props> = (state: Props[]) => void;

type ID = string;

interface HasID {
  id: ID;
}

interface Addition<Props> {
  type: "add";
  args: Props;
}

interface Removal {
  type: "remove";
  id: ID;
}

interface Update<Props> {
  type: "update";
  attr: keyof Props;
  id: ID;
  newState: Props;
}

type Difference<Props> = Addition<Props> | Removal | Update<Props>;

function diff<Root, Props extends HasID, Actual>(
  oldState: Props[],
  newState: Props[],
  config: Config<Root, Props, Actual>
): Difference<Props>[] {
  const differences: Difference<Props>[] = [];

  const oldIds = new Set();
  const oldItemsById = new Map<ID, Props>();
  const newIds = new Set();
  const newItemsById = new Map<ID, Props>();

  oldState.forEach(item => {
    oldIds.add(item.id);
    oldItemsById.set(item.id, item);
  });

  newState.forEach(item => {
    newIds.add(item.id);
    newItemsById.set(item.id, item);
  });

  const removedIds = difference(oldIds, newIds);
  const addedIds = difference(newIds, oldIds);

  removedIds.forEach(id => {
    differences.push({ type: "remove", id });
  });

  addedIds.forEach(id => {
    const props = newItemsById.get(id);

    if (props !== undefined) {
      differences.push({ type: "add", args: props });
    }
  });

  const shouldRecreate = config.shouldRecreate || neverRecreate;

  newState.forEach(item => {
    if (oldIds.has(item.id)) {
      const oldItem = oldItemsById.get(item.id);

      if (oldItem && shouldRecreate(oldItem, item)) {
        differences.push({ type: "remove", id: item.id });
        differences.push({ type: "add", args: item });

        return;
      }
    }

    for (let attr in config.attributes) {
      const oldItem = oldItemsById.get(item.id);

      if (oldItem) {
        const oldAttribute = oldItem[attr];

        if (config.attributes[attr].diff(item[attr], oldAttribute)) {
          differences.push({
            type: "update",
            attr,
            id: item.id,
            newState: item
          });
        }
      }
    }
  });

  return differences;
}

export function declarate<Root, Props extends HasID, Actual>(
  config: Config<Root, Props, Actual>,
  root: Root
): Patch<Props> {
  let oldState: Props[] = [];
  const cache = new Map<ID, Actual>();

  function patchDifference(difference: Difference<Props>): void {
    if (difference.type === "add") {
      const actual = config.create(root, difference.args);

      cache.set(difference.args.id, actual);

      config.attach(root, actual);
    } else if (difference.type === "remove") {
      const actual = cache.get(difference.id);

      if (actual) {
        config.remove(root, actual);

        cache.delete(difference.id);
      }
    } else if (difference.type === "update") {
      const actual = cache.get(difference.id);

      if (!actual) {
        throw new Error(
          `Tried to update item ${difference.id} but was not found`
        );
      }

      config.attributes[difference.attr].patch(
        root,
        difference.newState,
        actual,
        difference.newState[difference.attr]
      );
    }
  }

  return function patch(state) {
    const differences = diff(oldState, state, config);

    differences.forEach(patchDifference);

    oldState = state;
  };
}
