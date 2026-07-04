---
title: "Ethernet vs cross-over"
date: "2009-04-18"
sourceBlog: "My Internet Is Down"
sourceUrl: "https://my-internet-is-down.blogspot.com/2009/04/ethernet-vs-cross-over.html"
excerpt: "I fully apologize that it has been weeks since my last full update. Due to some issue with work schedules and a family emergency I was unable to update on my n"
---

I fully apologize that it has been weeks since my last full update.

Due to some issue with work schedules and a family emergency I was unable to update on my normal weekly schedule. I'm doing my best to get back to that starting now.

Normally published on Friday night... you can expect your next update on 4/24/09

OK on to the juicy stuff.

I told you that I was going to explain what a CAT 5 ethernet cable is and how it differs from a cross-over cable.

First let me say I found an [excellent resource here](http://www.ertyu.org/steven_nikkel/ethernetcables.html).

According to [Wikipedia](http://en.wikipedia.org/wiki/Cat_5):

> Category 5 cable, is a [twisted pair](http://en.wikipedia.org/wiki/Twisted_pair "Twisted pair") (4 pairs) high signal integrity cable type often referred to as "Cat5". Many such cables are [unshielded](http://en.wikipedia.org/wiki/Shield_%28electronics%29 "Shield (electronics)") but some are shielded. Category 5 has been superseded by the Category 5e specification [structured cabling](http://en.wikipedia.org/wiki/Structured_cabling "Structured cabling") for [computer](http://en.wikipedia.org/wiki/Computer_network "Computer network") [networks](http://en.wikipedia.org/wiki/Computer_network "Computer network") such as [Ethernet](http://en.wikipedia.org/wiki/Ethernet "Ethernet"), and is also used to carry many other signals such as basic [voice](http://en.wikipedia.org/wiki/Telephony "Telephony") services, [token ring](http://en.wikipedia.org/wiki/IBM_token_ring "IBM token ring"), and [ATM](http://en.wikipedia.org/wiki/Asynchronous_Transfer_Mode "Asynchronous Transfer Mode") (at up to 155 [Mbit](http://en.wikipedia.org/wiki/Megabit "Megabit")/s, over short distances).

The important part of this is the twisted pair part. The reasons the different pairs of wire are twisted, and each pair has its own twist frequency, is to minimize "cross-talk" or signal transfer from one pair of wires to another. That's the basis for a whole article in and of itself, so we will just leave it at that. The important part of cross-talk is to remember that if you are stripping CAT-5 wire in order to punch it down to a block or jack, don't untwist the wires further than you have to in order to make the connections.

OK here is a diagram of a standard CAT-5 ethernet cable:

![](/posts/ethernet-vs-cross-over/1.jpg)

The cool thing is that EVERY CAT-5 cable looks just like this. The outer sheaths vary according to the kind of use the cable will be put to, however the inner pairs remain the same, standardized in the IEEE standard on CAT-5.

What's that mean to you? You can look at any ethernet cable and expect to see a blue wire and a white wire with a blue stripe, a brown wire, and a white wire with a brown stripe, a green wire and a white wire with a green stripe, and last but not least, an orange wire and a white wire with an orange stripe.

Not only do the cables have a standard, they also fit together in a standard method.

#### Standard, Straight-Through Wiring (both ends are the same):

RJ45 Pin #

Wire Color
(T568A)

Wire Diagram
(T568A)

10Base-T Signal
100Base-TX Signal

1000Base-T Signal

1

White/Green

Transmit+

BI\_DA+

2

Green

Transmit-

BI\_DA-

3

White/Orange

Receive+

BI\_DB+

4

Blue

Unused

BI\_DC+

5

White/Blue

Unused

BI\_DC-

6

Orange

Receive-

BI\_DB-

7

White/Brown

Unused

BI\_DD+

8

Brown

Unused

BI\_DD-

Straight-Through Cable Pin Out for T568A

Straight through, or standard ethernet cable, means that the wires are straight through from one end of the cable to the other. Both ends are the same if you hold them and look at them side by side.

Just be aware that if you are told you will need a crossover cable that you can not use a straight through cable in its place, or vice versa.

This is just the difference between crossover and straight through cables. Anyone else have questions?

Links:

[http://www.ertyu.org/steven\_nikkel/ethernetcables.html](http://www.ertyu.org/steven_nikkel/ethernetcables.html)

[http://en.wikipedia.org/wiki/Cat\_5](http://en.wikipedia.org/wiki/Cat_5)
