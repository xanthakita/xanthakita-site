---
title: "Tools for the average person to use"
date: "2009-03-20"
sourceBlog: "My Internet Is Down"
sourceUrl: "https://my-internet-is-down.blogspot.com/2009/03/tools-for-average-person-to-use.html"
excerpt: "I use a lot of terms and words that are industry specific. However, I want you to learn some terms and some ideas. If you see a term that you don't understand p"
---

I use a lot of terms and words that are industry specific. However, I want you to learn some terms and some ideas.

If you see a term that you don't understand post a comment and ask what it means!

Tonight I want to talk about tools that are very usable for anyone to use.

Scenario:

You are sitting down at your computer, and you notice that you are having a very slow response when loading a web page.

The first thing you want to do is try to load another web page, see if it loads.  So for example if you are loading the [New York Times website](http://www.nytimes.com/) which is obviously based in New York, and it's running very slowly, try loading a page from the west coast, for example [The Seattle Times.](http://seattletimes.nwsource.com/html/home/index.html)

The reason you want to try this opposite coast load test is to see if there is a problem with the Internet getting to one part of the nation or another. An excellent tool for checking this is [The Internet Health Report](http://internethealthreport.com/).

Let's look at what you see when you go to that site.

1\. The main body of the site shows you the major backbone providers in the country (and the world),

[AT&T](http://internethealthreport.com/Main.aspx?DestinationValue=AT%26T&DestinationLevel=1 "AT&T")

[Cogent](http://internethealthreport.com/Main.aspx?DestinationValue=Cogent&DestinationLevel=1 "Cogent")

[Internap](http://internethealthreport.com/Main.aspx?DestinationValue=Internap&DestinationLevel=1 "Internap")

[Level3](http://internethealthreport.com/Main.aspx?DestinationValue=Level3&DestinationLevel=1 "Level3")

[NTT](http://internethealthreport.com/Main.aspx?DestinationValue=NTT&DestinationLevel=1 "NTT")

[Qwest](http://internethealthreport.com/Main.aspx?DestinationValue=Qwest&DestinationLevel=1 "Qwest")

[Savvis](http://internethealthreport.com/Main.aspx?DestinationValue=Savvis&DestinationLevel=1 "Savvis")

[SBC](http://internethealthreport.com/Main.aspx?DestinationValue=SBC&DestinationLevel=1 "SBC")

[Sprint](http://internethealthreport.com/Main.aspx?DestinationValue=Sprint&DestinationLevel=1 "Sprint")

[Verizon](http://internethealthreport.com/Main.aspx?DestinationValue=Verizon&DestinationLevel=1 "Verizon")

[XO](http://internethealthreport.com/Main.aspx?DestinationValue=XO&DestinationLevel=1 "XO")

Across the top and the bottom of the table. You can look at the table and see (by default) where any latency issues (if any are occurring, or have occurred in the last hour).

Terms:

Internet Backbone providers: ([This definition from Wikipedia](http://en.wikipedia.org/wiki/Internet_backbone)):

> The **Internet backbone** refers to the main ["trunk"](http://en.wikipedia.org/wiki/Trunking "Trunking") connections of the [Internet](http://en.wikipedia.org/wiki/Internet "Internet"). It is made up of a large collection of interconnected commercial, government, academic and other high-capacity data routes and [core routers](http://en.wikipedia.org/wiki/Core_router "Core router") that carry data across the countries, continents and oceans of the world.

Latency: ([Definition thanks to Fengnet.com](http://fengnet.com/book/Optimizing-Applications/ch03lev1sec1.html) ):

> Latency is the time it takes for a packet to cross a network connection (as seen at Layer 3, the network layer), from sender to receiver, and the period of time that a frame is held by a network device before it is forwarded.

You can also look at network availability (100 is best! it's a percentage) and packet loss (0 is what you want to see on this!)

OK so you look at there is no latency, and you're still having a hard time getting to the website you want to load.

A good test to see if you are actually getting to the Internet is [PingGraph](http://tinyurl.com/cywmpa)  With this tool you can test two specific features.

1.  Can you ping to a given URL?
2.  Can you ping to a given IP address?

So what's the big deal? If you can ping to the IP but not to the URL your Internet is fine, you have an issue with your DNS server

[Definition - DNS](http://uits.arizona.edu/index.php?id=1733): Domain Name Server - In the Internet suite of protocols, a server that responds to queries from clients for name-to-(IP)address and address-to-name mappings as well as for other information.

Now to test:  When you open PingGraph you will see a window with a blank field labeled Address:

First type in the URL of the site you are trying to get to.  For example yahoo.com then click the green arrow to the right of the field.

If you see blue lines every 3 seconds then you are successfully pinging.

If you see RED... well... then you have a problem.

OK at this point, we want to put in a known good IP address, for example the OpenDNS DNS servers 208.67.222.222

Type that IP into the address field and click the green arrow again.  Now is when you can determine if your internet is down or if you are just unable to get to the site you are going to. If the IP address comes back with red (it didn't ping) then you can be pretty sure your internet connection is down... and there are steps to follow.

Now is when you have to get your hands dirty (figuratively speaking)

1.  If you are on a Windows XP, or even Vista machine, go to the start menu and find the run command (Vista just type in the search box) and type CMD then press Enter.
2.  A black window will display with c:\\something something\\ as a prompt. No, it doesn't REALLY say Something Something, it just varies from machine to machine!
3.  At the DOS prompt type ipconfig and press enter, you will get about 4 lines back. Look for the default gateway IP address. (Probably 192.168.1.1, or 192.168.1.254)
4.  type ping (and the gateway IP) so if it were 192.168.1.1 type: ping 192.168.1.1 and press enter
5.  you should get the following back

>
>
> Microsoft Windows XP \[Version 5.1.2600\]
> (C) Copyright 1985-2001 Microsoft Corp.
>
> C:\\Documents and Settings\\Playgames>ping 192.168.1.99
>
> Pinging 192.168.1.99 with 32 bytes of data:
>
> Reply from 192.168.1.99: bytes=32 time<1ms ttl="64" bytes="32" ttl="64" bytes="32" ttl="64" bytes="32" ttl="64" sent =" 4," received =" 4," lost =" 0" minimum =" 0ms," maximum =" 0ms," average =" 0ms">

6\. OK now hopefully you see the line that says "Packets: Sent = 4, Received = 4, Lost = 0 (0%loss) If you do, then you know your computer is talking to your router... on the other hand, if you got "Packets: Send = 4, Received = 0, Lost = 4 (100% loss)" you have a problem.  If that's the problem turn your computer off, then turn off your router, and your modem (cable modem or DSL). Turn the modem back on let it "sync" up (all the lights should turn green (hopefully)
After the Modem is in sync turn on your router, let it sit for a minute or so in order to make certain it connects to the modem. Then turn on your computer. Retest, try the internet if it's up good show! Otherwise retest your connection to your router.

If the connectivity to the router fails again... chances are you have a router that has failed. ( It could be the NIC card (ethernet card) but it's not likely)
Alright, now, I'm making an assumption here, that your computer is working properly, if your router fails then you need to get a new one.
If resetting your router and pc reestablishes your connection to your router and you still can't get to the internet, then chances are it's either your modem or your service provider.
Go get a cup of coffee, or a can of coke put on something comfortable.

Before you call your provider, just to make sure that it's not your router, plug the ethernet cable from your computer directly into your modem. You might have to restart again for your pc to get a new IP address from the modem. Once it's up test again, see if you can get to the internet, see if you can ping your gateway. If it still fails, then call your provider.
It is always best to have just one computer plugged into your [cablemodem or DSL modem](http://tinyurl.com/cdqcx7) when you call your ISP. That way there can be no chance that your router is having an issue. Now a personal plug, when you call your ISP, please don't get angry with the customer service rep, they ask you all of those questions because they have no choice, they have to follow their script, even though they don't like it any better than you do.

Follow instructions and test with them hopefully, provided you have paid your bill, they will be able to get you back up and running while on the phone.
That covers just a couple of tools. Next blog will have additional tools and useful tips!
