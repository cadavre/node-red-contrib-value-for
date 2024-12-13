const { clearTimer, match, reset } = require('./common.js');

module.exports = function(RED) {

    function FixedForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueMatched = false;
        this.lastValue = null;
        this.orignalMsg = null;

        if (config.units === "s") { config.for = config.for * 1000; }
        if (config.units === "min") { config.for = config.for * 1000 * 60; }
        if (config.units === "hr") { config.for = config.for * 1000 * 60 * 60; }

        let node = this;

        if (config.ondeploy) {
            match(node, config, { payload: null });
        }

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    reset(node, true);
                    return;
                }
                // Prepare current payload for comparion
                let currentValue = String(msg.payload);
                if (!config.casesensitive) {
                    currentValue = currentValue.toLowerCase();
                }
                // On 1st-time deployment - make sure there is a `lastValue`
                if (!node.lastValue) {
                    node.lastValue = currentValue;
                }
                // Compare values
                if (currentValue === node.lastValue) {
                    node.valueMatched = true;
                } else {
                    node.valueMatched = false;
                }
                node.lastValue = currentValue;
                // Act
                if (node.valueMatched) {
                    match(node, config, msg);
                } else {
                    clearTimer(node);
                    match(node, config, msg);
                }
            }
        });

        this.on('close', function() {
            clearTimer(node);
        });
    }
    RED.nodes.registerType('fixed-for', FixedForNode);
}
