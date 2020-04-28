module.exports = function(RED) {

    function RangeForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueInRange = false;

        if (config.units == "s") { config.for = config.for * 1000; }
        if (config.units == "min") { config.for = config.for * 1000 * 60; }
        if (config.units == "hr") { config.for = config.for * 1000 * 60 * 60; }

        let node = this;

        function clearTimer() {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                var msg = {
                    payload: 'reset'
                }
                node.send([null, msg]);
            }
            node.status({});
        }

        function timerFn() {
            var msg = {
                payload: 'triggered'
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
                var current_value = Number(msg.payload);
                if (!isNaN(current_value)) {
                    if (config.below !== null) {
                        if (current_value > config.below) {
                            node.valueInRange = false;
                        } else {
                            node.valueInRange = true;
                        }
                    }
                    if (config.above !== null) {
                        if (current_value < config.above) {
                            node.valueInRange = false;
                        } else {
                            node.valueInRange = true;
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
                }
            }
        });

        this.on('close', function() {
            clearTimer();
        });
    }
    RED.nodes.registerType('range-for', RangeForNode);
}
