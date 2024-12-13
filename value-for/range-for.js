module.exports = function(RED) {

    function RangeForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueInRange = false;
        this.lastValue = null;
        this.orignalMsg = null;

        if (config.units == "s") { config.for = config.for * 1000; }
        if (config.units == "min") { config.for = config.for * 1000 * 60; }
        if (config.units == "hr") { config.for = config.for * 1000 * 60 * 60; }

        if (config.below == "") { config.below = null; } else { config.below = Number(config.below) }
        if (config.above == "") { config.above = null; } else { config.above = Number(config.above) }

        let node = this;

        function clearTimer(isReset = false) {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                node.valueInRange = false;
                const msg = {
                    ...node.orignalMsg,
                    reset: 1,
                }
                node.send([null, msg]);
            }
            node.status({fill: "grey", shape: "dot", text: `${isReset ? 'reset' : node.lastValue} ${getFormattedNow()}`});
        }

        function setTimer() {
            if (node.timeout === null) {
                node.timeout = setTimeout(timerFn, config.for);
                node.status({fill: "green", shape: "ring", text: `${node.lastValue} ${getFormattedNow()}`});
            }
        }

        function timerFn() {
            node.send([node.orignalMsg, null]);
            node.status({fill: "green", shape: "dot", text: `${node.lastValue} ${getFormattedNow('since')}`});
            if (config.continuous) {
                node.timeout = null;
            }
        }

        function getFormattedNow(prefix = 'at') {
            const now = new Date();
            const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric' });
            const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = dateTimeFormat.formatToParts(now);
            return `${prefix}: ${month} ${day}, ${hour}:${minute}`;
        }

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    clearTimer(true);
                    return;
                }
                // Store original message (first or latest)
                if (config.keepfirstmsg) {
                    if (!node.orignalMsg) {
                        node.orignalMsg = msg;
                    }
                } else {
                    node.orignalMsg = msg;
                }
                // Prepare current payload for comparion
                let currentValue = Number(msg.payload);
                if (!isNaN(currentValue)) {
                    // Compare values
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
                    node.lastValue = currentValue;
                    // Act
                    if (node.valueInRange) {
                        setTimer();
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
