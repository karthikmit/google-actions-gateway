class LocalCache {

    constructor() {
        this.cache_map = {

        }
    }

    getValue(key) {
        if(this.cache_map.hasOwnProperty(key)) {
            return this.cache_map[key];
        }
        return null;
    }

    setValue(key, value) {
        this.cache_map[key] = value;
    }
}

module.exports = {
    cache : new LocalCache()
};