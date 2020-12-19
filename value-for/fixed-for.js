module.exports = function(RED) {

    function FixedForNode(config) {
        RED.nodes.createNode(this, config);
        this.timeout = null;
        this.valueMatched = false;
        this.lastValue = null;

        if (config.units == "s") { config.for = config.for * 1000; }
        if (config.units == "min") { config.for = config.for * 1000 * 60; }
        if (config.units == "hr") { config.for = config.for * 1000 * 60 * 60; }

        let node = this;

        function clearTimer(isReset = false) {
            if (node.timeout !== null) {
                clearTimeout(node.timeout);
                node.timeout = null;
                var msg = {
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
            clearTimeout(node.timeout);
            node.timeout = null;
            var msg = {
                payload: node.lastValue
            }
            node.send([msg, null]);
            node.status({fill: "green", shape: "dot", text: `${node.lastValue} ${getFormattedNow()}`});
            if (config.continuous) {
                setTimer();
            }
        }

        function getFormattedNow() {
            var now = new Date();
            const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric' });
            const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = dateTimeFormat.formatToParts(now);
            return `at: ${month} ${day}, ${hour}:${minute}`;
        }

        if (config.ondeploy) {
            setTimer();
        }

        this.on('input', function(msg) {
            if (msg.hasOwnProperty('payload')) {
                if (msg.payload === 'reset') {
                    clearTimer(true);
                }
                var currentValue = String(msg.payload);
                if (!config.casesensitive) {
                    currentValue = currentValue.toLowerCase();
                }
                if (currentValue !== '') {
                    console.log('currentValue:'+currentValue+' lastValue:'+node.lastValue);
                    if (currentValue === node.lastValue || node.lastValue === null) {
                        console.log('matched');
                        node.valueMatched = true;
                    } else {
                        node.valueMatched = false;
                    }
                    node.lastValue = currentValue;
                    if (node.valueMatched) {
                        console.log('setTimer');
                        setTimer();
                    } else {
                        console.log('clearTimer');
                        clearTimer();
                    }
                }
            }
        });

        this.on('close', function() {
            clearTimer();
        });
    }
    RED.nodes.registerType('fixed-for', FixedForNode);
}
