import { reset, match, clearTimer } from './common';

module.exports = function(RED) {

    function ValueForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueMatched = false;
        this.lastValue = null;
        this.orignalMsg = null;

        if (config.units === "s") { config.for = config.for * 1000; }
        if (config.units === "min") { config.for = config.for * 1000 * 60; }
        if (config.units === "hr") { config.for = config.for * 1000 * 60 * 60; }

        config.value = String(config.value)
        if (!config.casesensitive) {
            config.value = config.value.toLowerCase();
        }

        let node = this;

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
                if (currentValue !== '') {
                    // Compare values
                    if (currentValue === config.value) {
                        node.valueMatched = true;
                    } else {
                        node.valueMatched = false;
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
    RED.nodes.registerType('value-for', ValueForNode);
}
