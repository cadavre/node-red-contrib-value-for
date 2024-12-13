export function clearTimer(node) {
    clearTimeout(node.timeout);
    node.timeout = null;
}

export function reset(node, manual = false) {
    // Stop timer (if started)
    // Send 2nd output message
    if (node.timeout !== null) {
        const msg = {
            ...node.orignalMsg,
            reset: 1,
        }
        node.send([null, msg]);
        node.status({fill: "grey", shape: "dot", text: `${manual ? 'reset' : node.lastValue} ${getFormattedNow()}`});
        clearTimer();
    }
    // Cleanup
    node.valueMatched = false;
    node.orignalMsg = null;
}

export function match(node, config, originalMsg) {
    // Start timer (if not yet started)
    if (node.timeout === null) {
        node.timeout = setTimeout(timerFn.bind(node, [node, config]), config.for);
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

function timerFn(node, config) {
    // Send 1st output message
    node.send([node.orignalMsg, null]);
    node.status({fill: "green", shape: "dot", text: `${node.lastValue} ${getFormattedNow('since')}`});
    clearTimer();
    if (config.continuous) {
        match(node.orignalMsg);
    }
}

function getFormattedNow(prefix = 'at') {
    const now = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour12: false, hour: 'numeric', minute: 'numeric' });
    const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = dateTimeFormat.formatToParts(now);
    return `${prefix}: ${month} ${day}, ${hour}:${minute}`;
}
