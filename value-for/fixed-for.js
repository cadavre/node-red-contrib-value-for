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

        function clearTimer(isReset = false) {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                const msg = {
                    ...node.orignalMsg,
                    reset: 1,
                }
                node.send([null, msg]);
            }
            node.orignalMsg = null;
            node.status({fill: "grey", shape: "dot", text: `${isReset ? 'reset' : node.lastValue} ${getFormattedNow()}`});
        }

        function matched(originalMsg) {
            // Start timer (if not yet started)
            if (node.timeout === null) {
                node.timeout = setTimeout(timerFn, config.for);
                node.status({fill: "green", shape: "ring", text: `${node.lastValue} ${getFormattedNow()}`});
            }
            // Store original message (first or latest)
            if (config.keepfirstmsg) {
                if (!node.orignalMsg) {
                    node.orignalMsg = originalMsg;
                }
            } else {
                node.orignalMsg = originalMsg;
            }
        }

        function timerFn() {
            clearTimeout(node.timeout);
            node.timeout = null;
            node.send([node.orignalMsg, null]);
            node.status({fill: "green", shape: "dot", text: `${node.lastValue} ${getFormattedNow('since')}`});
            if (config.continuous) {
                matched(node.orignalMsg);
            }
        }

        function getFormattedNow(prefix = 'at') {
            const now = new Date();
            const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric' });
            const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = dateTimeFormat.formatToParts(now);
            return `${prefix}: ${month} ${day}, ${hour}:${minute}`;
        }

        if (config.ondeploy) {
            matched({ payload: null });
        }

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    clearTimer(true);
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
                    matched(msg);
                } else {
                    clearTimer();
                    matched(msg);
                }
            }
        });

        this.on('close', function() {
            clearTimer();
        });
    }
    RED.nodes.registerType('fixed-for', FixedForNode);
}
