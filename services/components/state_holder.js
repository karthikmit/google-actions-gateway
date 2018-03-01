class StateHolder {

    constructor() {
        this.currentStateMap = {

        }
    }

    setCurrentState(convId, stateString) {
        this.currentStateMap[convId] = stateString;
    }

    getCurrentState(convId) {
        return this.currentStateMap[convId];
    }
}

module.exports = {
    stateHolder : new StateHolder()
};