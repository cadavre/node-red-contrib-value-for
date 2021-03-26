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

        function clearTimer(isReset = false) {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                const msg = {
                    reset: 1,
                    payload: node.lastValue
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
            const msg = {
                payload: node.lastValue
            }
            node.send([msg, null]);
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
                let currentValue = String(msg.payload);
                if (!config.casesensitive) {
                    currentValue = currentValue.toLowerCase();
                }
                if (currentValue !== '') {
                    if (currentValue === config.value) {
                        node.valueMatched = true;
                    } else {
                        node.valueMatched = false;
                    }
                    node.lastValue = currentValue;
                    if (node.valueMatched) {
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
    RED.nodes.registerType('value-for', ValueForNode);
}
