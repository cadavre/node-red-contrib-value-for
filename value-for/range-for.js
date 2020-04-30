module.exports = function(RED) {

    function RangeForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueInRange = false;
        this.lastValue = null;

        if (config.units == "s") { config.for = config.for * 1000; }
        if (config.units == "min") { config.for = config.for * 1000 * 60; }
        if (config.units == "hr") { config.for = config.for * 1000 * 60 * 60; }

        let node = this;

        function clearTimer() {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                node.valueInRange = false;
                var msg = {
                    reset: 1,
                    payload: node.lastValue
                }
                node.send([null, msg]);
            }
            node.status({});
        }

        function timerFn() {
            var msg = {
                payload: node.lastValue
            }
            node.send([msg, null]);
            node.status({});
            if (config.continuous) {
                node.timeout = null;
            }
        }

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    clearTimer();
                }
                var currentValue = Number(msg.payload);
                if (!isNaN(currentValue)) {
                    if (config.below !== null && config.above !== null) {
                        if (currentValue > config.above && currentValue < config.below) {
                            node.valueInRange = true;
                        } else {
                            node.valueInRange = false;
                        }
                    } else {
                        if (config.below !== null) {
                            if (currentValue < config.below) {
                                node.valueInRange = true;
                            } else {
                                node.valueInRange = false;
                            }
                        }
                        if (config.above !== null) {
                            if (currentValue > config.above) {
                                node.valueInRange = true;
                            } else {
                                node.valueInRange = false;
                            }
                        }
                    }
                    if (node.valueInRange) {
                        if (node.timeout === null) {
                            node.timeout = setTimeout(timerFn, config.for);
                            node.status({fill: "blue", shape: "dot", text: "in_range"});
                        }
                    } else {
                        clearTimer();
                    }
                    node.lastValue = currentValue;
                }
            }
        });

        this.on('close', function() {
            clearTimer();
        });
    }
    RED.nodes.registerType('range-for', RangeForNode);
}
