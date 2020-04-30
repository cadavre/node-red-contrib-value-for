module.exports = function(RED) {

    function ValueForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueMatched = false;
        this.lastValue = null;

        if (config.units == "s") { config.for = config.for * 1000; }
        if (config.units == "min") { config.for = config.for * 1000 * 60; }
        if (config.units == "hr") { config.for = config.for * 1000 * 60 * 60; }

        config.value = String(config.value)
        if (!config.casesensitive) {
            config.value = config.value.toLowerCase();
        }

        let node = this;

        function clearTimer() {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
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
                var currentValue = String(msg.payload);
                if (!config.casesensitive) {
                    currentValue = currentValue.toLowerCase();
                }
                if (currentValue !== '') {
                    if (currentValue === config.value) {
                        node.valueMatched = true;
                    } else {
                        node.valueMatched = false;
                    }
                    if (node.valueMatched) {
                        if (node.timeout === null) {
                            node.timeout = setTimeout(timerFn, config.for);
                            node.status({fill: "blue", shape: "dot", text: "matched"});
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
    RED.nodes.registerType('value-for', ValueForNode);
}
