const { clearTimer, match, reset } = require('./common.js');

module.exports = function(RED) {

    function RangeForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueMatched = false;
        this.lastValue = null;
        this.orignalMsg = null;

        if (config.units === "s") { config.for = config.for * 1000; }
        if (config.units === "min") { config.for = config.for * 1000 * 60; }
        if (config.units === "hr") { config.for = config.for * 1000 * 60 * 60; }

        if (config.below === "") { config.below = null; } else { config.below = Number(config.below) }
        if (config.above === "") { config.above = null; } else { config.above = Number(config.above) }

        let node = this;

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    reset(node, true);
                    return;
                }
                // Prepare current payload for comparion
                let currentValue = Number(msg.payload);
                if (!isNaN(currentValue)) {
                    // Compare values
                    if (config.below !== null && config.above !== null) {
                        // Above AND below set
                        if (currentValue > config.above && currentValue < config.below) {
                            node.valueMatched = true;
                        } else {
                            node.valueMatched = false;
                        }
                    } else {
                        // ONLY below set
                        if (config.below !== null) {
                            if (currentValue < config.below) {
                                node.valueMatched = true;
                            } else {
                                node.valueMatched = false;
                            }
                        }
                        // ONLY above set
                        if (config.above !== null) {
                            if (currentValue > config.above) {
                                node.valueMatched = true;
                            } else {
                                node.valueMatched = false;
                            }
                        }
                    }
                    node.lastValue = currentValue;
                    // Act
                    if (node.valueMatched) {
                        match(node, config, msg);
                    } else {
                        reset(node);
                    }
                }
            }
        });

        this.on('close', function() {
            clearTimer(node);
        });
    }
    RED.nodes.registerType('range-for', RangeForNode);
}
