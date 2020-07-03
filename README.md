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
which you can use to listen for numeric value change "over", "below" or "out of range", but you cannot listen to value change
"inside the range" or string input. `node-red-contrib-value-for` also adds `for` parameter to listen if value haven't excursed
from configured range/value for given period of time.

This nodes always does nothing after receiving just a first/single message. It works only as a comparator on message receival.

## Usage

### range-for

Takes `above` and/or `below` numeric values to describe a values range. Once input value matches the range, starts a timer
with given `for` period. If incoming input values won't excurse from that range – will trigger single output after configured period.

Any input value that excure from configured range or input `msg.payload = "reset"` will reset the timer and trigger a second output once.

![range-for node](https://github.com/cadavre/node-red-contrib-value-for/raw/master/images/range-for.png)

### value-for

Takes `value` string to compare with incoming message payload. Once input value matches configured value, starts a timer
with given `for` period. If incoming input values won't change from that value – will trigger single output after configured period.

Any input value different from configured value or input `msg.payload = "reset"` will reset the timer and trigger a second output once.

Values are compared as strings! Therefor you can choose to make case (in)sensitive matching.

![value-for node](https://github.com/cadavre/node-red-contrib-value-for/raw/master/images/value-for.png)

### Generic options

You can configure nodes to report just once after the range/value matched configuration or report continously starting new timers
each time a value confirming match in range/value is incoming as input. New timer will start only if new message comes in!

## Changelog

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
