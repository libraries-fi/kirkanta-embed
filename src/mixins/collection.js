class Collection {
  constructor(entity_class, items, refs) {
    this.__class = entity_class;
    this.__items = items;
    this.__refs = refs || {};
  }

  * [Symbol.iterator]() {
    for (let item of this.__items) {
      const Entity = this.__class;
      yield new Entity(item, this.__refs);
    }
  }
}

export default Collection;
