---
title: "Hey! That's MY Wireless Internet!"
date: "2009-04-03"
sourceBlog: "My Internet Is Down"
sourceUrl: "https://my-internet-is-down.blogspot.com/2009/04/hey-thats-my-wireles-internet.html"
excerpt: "This has been a VERY busy week. I'm working for 18 nights in a row, covering for the weekend guy. As a result, I'm tired and I'm at work instead of at home. But"
---

[![](/posts/hey-thats-my-wireles-internet/1.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgY3vnoInHfrfq-EV-SJ8h15iyenLYSo3uqVy2mXRDfdNMSDamsF77mpTbYxJLKJlD07UR8Y4JNsfo5E-Yx_z4GsncnXhNvgoapj_G3zzK2RDjiS4oVrspXog3Z1DCZk5_YmE2kW2-2DBI/s1600-h/networksecurity_protect.jpg)This has been a VERY busy week. I'm working for 18 nights in a row, covering for the weekend guy. As a result, I'm tired and I'm at work instead of at home. But in between calls I found time to write this blog.  
  
I told you I was going to write an article about securing your wireless network, and I am. I'm going to focus on home users. Frankly, commercial enterprises shouldn't be using the home style routers. They are better off using a firewall to protect their networks.  
  
First of all let's look at what a wireless network is. I borrowed the above and following images from [http://www.swanswireless.com/\_wsn/page4.html](http://www.swanswireless.com/_wsn/page4.html)  
  
At typical wireless network is setup much like this image.  
[![](/posts/hey-thats-my-wireles-internet/2.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGjMU3wdwbhnyszbb-680S0f40HvABdWFjNsWmLIxa-W_Q2Kx63pzkUObbw6gVc2aOIELQslGn6EWcgAXfkvd365wJs1HsY3KfVY5-U4Bx4fA6rDfCx4ediRp4PS-TwYB3fuHzld3rgGM/s1600-h/typical-wireless-setup.jpg)You have your Internet modem (DSL, Cable modem, or some other variety.), then you have a router with wireless technology built in. Of course there are variations and your mileage may vary. some popular home routers for wireless are [Linksys Wireless-N Home Router WRT150N Wireless router - EN, Fast EN, IEEE 802.11b, IEEE 802.11g, IEEE 802.11n (draft) From $36-$119](//www.google.com/products/catalog?q=wireless+home+routers&oe=utf-8&cid=6734708522446557467&sa=title#ps-sellers) (Don't worry I'll try to explain all those letters and numbers in a bit) [NETGEAR WGR614 IEEE 802.3/3u, IEEE 802.11b/g Wireless-G Router Around $40.00](http://www.newegg.com/Product/Product.aspx?Item=N82E16833122016) or the slightly more expensive [ZyXEL Communications ZyXEL NBG\-318S Home Network Kit Wireless router - EN, Fast EN, IEEE 802.11b, IEEE 802.11g, HomePlug AV (HPAV) for $143 to $215](//www.google.com/products/catalog?q=wireless+home+routers&oe=utf-8&cid=7076548067376610152&sa=title#ps-sellers)  
  
There is a wide price range, $39.99 to $215 and probably higher if you want to start looking in the commercial range. It's always important to remember that you get what you pay for. I wouldn't go for a $40 bargain basement model, and most people don't need the $215 Cadillac version either. Personally I have a Netgear which I paid $99 for. It gets the job done.  
  
Before we look at securing your router, let's look at some of those numbers and letters after the names above.  

-   EN - Ethernet
-   Fast EN - Fast Ethernet
-   IEEE - Institute of Electrical and Electronics Engineers
-   The numbers, 802.11 and 802.11g refer to documents at IEEE defining how wireless networking is supposed to work.

OK now on to security. Why do you want to secure your wireless network? Or should you care? Some folks say, "I don't really care? why should I bother?" and I suppose if you live out in the country and have no neighbors within 3-500 yards of your house that it really doesn't matter. Leave it wide open and be happy. However, if you live in town , or even in an apartment, you probably want to secure your network. From my apartment, I can see 6 or 7 wireless networks, one or two of which are always unsecured.  
  
There are some common practices which people use to secure their wireless routers, but some while common are not always best. For example, turning off the [Broadcast SSID](http://searchmobilecomputing.techtarget.com/sDefinition/0,,sid40_gci853455,00.html?int=off) of your wireless network is not really recommended, even though most people turn it off first thing. Why, you might ask. Well apparently when the SSID is no longer broadcast your network devices have to constantly broadcast additional information to make certain that everyone is talking. If you have one or two wireless devices this may not have enough impact to matter, but if you have several, then it might cause some slowness. So how are you supposed to hide your wireless network if you broadcast your SSID? First change the name, most manufacturers use a default name, Linksys uses, linksys (Big surprise) and Tsunami, or Netgear. There is a [great article with naming hints and tips on about.com](http://compnetworking.about.com/cs/wirelessproducts/qt/changessid.htm).  
  
Next, change the default admin name and password. whatever you do Don't leave them set to the [default router password](http://www.routerpasswords.com/index.asp) it' way to easy to find the default password. I suggest you use a tool like [Microsoft's tool](http://www.microsoft.com/protect/yourself/password/checker.mspx) or for more information use [The Password Checker](http://www.microsoft.com/protect/yourself/password/checker.mspx) to test the strength of your password.  
  
another thing to change, if you plan to manage your router remotely (from somewhere else) change the default port. Pick a number you can remember (usually between 8000 and 60000), if you are not planing on ever accessing your router remotely be sure to disable the remote management selection. (see your router manual for specific instructions on how to do this.)  
  
Just changing the default network name and ports and making sure you set the admin ID and password make your router much safer, but it's still got a glaring hole. All of the traffic on that network is broadcast in plain text. Whats that mean? If someone is using a tool like [Netstumbler](http://www.netstumbler.com/downloads/) a tool for finding wireless networks, and some other tools which would allow them to "sniff" the packets going through the air, weather they are on the LAN or not. If they have the correct tools to capture and sniff packets then they are already on your LAN. So what are you to do? set at least some basic security, WEP is not secure, but it will at least stop most novice hackers, better still use WAP v1 or 2 check out [this wikipedia article](http://en.wikipedia.org/wiki/Wireless_security) about the possible security settings and risks.  
  
So now you have changed the default name of your network, the default port and set a unique admin ID and password. Then you turned on encryption. So are you secure? probably not, but you are a whole lot better off than you were! And It's probably a fair bet that the neighbors aren't going to use your wireless internet to download all of their warez and hot music!  
  
I 'm going to write an article on email next, I think, what the various settings are and how you can use them to your advantage. See you next week!  
  
Please feel free to leave comments and ask questions!
