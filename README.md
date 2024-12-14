This package provides two nodes that compare string or numeric values to message payloads.
If input string equals configured value or input value is in configured range - starts timer
for configured period of time. If input value won't excurse from configured for given period
of time – will trigger single message to 1st output. 2nd output is used for reporting reset.

# Installation
```
npm install node-red-contrib-value-for
```

## About

This nodes can be used to listen if reported sensor values are in configured range for given period of time,
and if yes - report that fact on output.

This library is similar to (and inspired by) [node-red-contrib-edge-trigger](https://github.com/eschava/node-red-contrib-edge-trigger)
which you can use to listen for numeric value change "over", "below" or "out of range", but you cannot listen to value 
change "inside the range" or string input. `node-red-contrib-value-for` also adds `for` parameter to listen if value 
haven't excursed from configured range/value for given period of time.

## Usage

### range-for

Takes `above` and/or `below` numeric values to describe a values range. Once input value matches the range, starts 
a timer with given `for` period. If incoming input values won't excurse from that range – will trigger single output 
after configured period.

Any input value that excure from configured range or input `msg.payload = "reset"` will reset the timer and trigger 
a second output once.

![range-for node](https://github.com/cadavre/node-red-contrib-value-for/raw/master/images/range-for.png)

### value-for

Takes `value` string to compare with incoming message payload. Once input value matches configured value, starts 
a timer with given `for` period. If incoming input values won't change from that value – will trigger single 
output after configured period.

Any input value different from configured value or input `msg.payload = "reset"` will reset the timer and trigger 
a second output once.

**Values are compared as strings!** Therefor you can choose to make case (in)sensitive matching.

![value-for node](https://github.com/cadavre/node-red-contrib-value-for/raw/master/images/value-for.png)

### fixed-for

This node compares current value on input with previous value sent to input. If value won't change `for`
given period of time – node will trigger first output.

Normally this node waits for first input message to start comparison timer. You can optinally select to
start comparison timer on node (re)deployment, so if no message at all will hit node input – it will also
trigger first output. This is helpful for critical messages that must be compared even on i.e. NodeRED restart.

**Watch out!** When using timer since (re)deployment – if no message was received in the input – the output 
message will be `{ payload: null }`. Make sure your flow can handle this situation correctly!

**Values are compared as strings!** Therefor you can choose to make case (in)sensitive matching.

![fixed-for node](https://github.com/cadavre/node-red-contrib-value-for/raw/master/images/fixed-for.png)

### Generic options

You can configure nodes to report just once after the range/value matched configuration or report continously 
starting new timers each "for" time.

## Changelog

#### 1.0.0

* Code cleanup; extracted common part.
* Fixed repeating when the value was not out-of-range/value and no "for" was selected.

#### 0.4.0

* Unified most of the code
* Fixed repeats to act when no new value was received on the input
* Fixed unwanted repeats to happen when new (but same) values were received on the input

#### 0.3.5

* Instead of just latest value – a whole original msg will be forwarded to the output.
* You can select if the very first message shall be forwarded or the latest one.

#### 0.3.4

* Improved node status texts

#### 0.3.3

* Fixed fixedfor for empty string and null values 

#### 0.3.2

* Removed console.logs

#### 0.3.0

* Added `fixed-for` node.
* Small typo fixes.

#### 0.2.2

* Improved node status output.

#### 0.2.1

* Fixed config values not being parsed as Numbers that resulted in comparison of Number vs String.
* Improved node status output.

#### 0.2.0

* Fixed some values above "below" triggering in_range.
* Added `msg.payload` to return last reported value.
* Added `msg.reset = 1` to 2nd output and also `msg.payload` to return last reported value.

#### 0.1.2

* Changed nodes color to violet.

#### 0.1.1

* Minor bugs fixed.

#### 0.1.0

* Initial version.
