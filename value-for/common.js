const clearTimer = function(node) {
    clearTimeout(node.timeout);
    node.timeout = null;
}

const reset = function(node, manual = false) {
    // Stop timer (if started)
    // Send 2nd output message
    if (node.timeout !== null) {
        const msg = {
            ...node.orignalMsg,
            reset: 1,
        }
        node.send([null, msg]);
        node.status({fill: "grey", shape: "dot", text: `${manual ? 'reset' : node.lastValue} ${getFormattedNow()}`});
        clearTimer(node);
    }
    // Cleanup
    node.valueMatched = false;
    node.orignalMsg = null;
}

const match = function(node, config, originalMsg) {
    // Start timer (if not yet started)
    if (node.timeout === null) {
        node.timeout = setTimeout(timerFn.bind(null, node, config), config.for);
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

const timerFn = function(node, config) {
    // Send 1st output message
    node.send([node.orignalMsg, null]);
    node.status({fill: "green", shape: "dot", text: `${node.lastValue} ${getFormattedNow('since')}`});
    clearTimer(node);
    if (config.continuous) {
        match(node, config, node.orignalMsg);
    }
}

const getFormattedNow = function(prefix = 'at') {
    const now = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric' });
    const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = dateTimeFormat.formatToParts(now);
    return `${prefix}: ${month} ${day}, ${hour}:${minute}`;
}

module.exports.clearTimer = clearTimer
module.exports.reset = reset
module.exports.match = match
