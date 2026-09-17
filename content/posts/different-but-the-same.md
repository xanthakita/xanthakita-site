---
title: "Different, but the Same"
date: "2026-09-17"
excerpt: "A note to my nephew about AI. He is against it for the land, the water, the power, and the politics. He is not wrong about the problems. Here is why I am not against it anyway, with the receipts."
---

My nephew and I disagree about AI. He is against it, and not in a vague way. He can tell you why: the data centers eat electricity and water, they take land from communities that never asked for them, the models were trained on other people's work without permission, and the current administration is cheering the whole thing on. Those are real objections. I have watched people wave them off with a shrug, and I am not going to do that here. He is not wrong about the problems.

I am not against it. I build software with it every day, including the kennel management app that runs my breeding program, and I have spent enough years around this industry to see both the harm and the work going into fixing the harm. So I owe him something better than "you'll come around." I owe him the case, with references, and an honest accounting of what is and is not likely to make a difference. That is what this is.

## You are already using it

Let's start with the part that surprises people. If you use the internet at all, you are using AI, and you have been for years.

Gmail's spam filter has run on machine learning since long before anyone said "ChatGPT." By 2017 Google was already saying it blocked 99.9 percent of spam and phishing that way [1]. Google search has used a machine learning system called RankBrain to interpret queries since 2015, and it was the first deep learning system deployed in search [2]. When your bank texts you about a charge that looks wrong, that is a model too. Visa says its models helped block about 40 billion dollars in fraud in a single year [3]. Face unlock on your phone, the route your maps app picks, the autocorrect that fixes your typing, the captions on a video, the "you might also like" on every store you shop at. All of it.

And then there is social media, which is where most of the loudest anti-AI posts get made. Every feed you scroll is assembled by a recommendation model deciding what you see next. Meta told its investors in 2025 that improvements to those models alone drove a 5 percent increase in time spent on Facebook and 6 percent on Instagram [4]. A post that says "I refuse to use AI," typed into a box on a platform whose entire business is an AI picking who sees that post, is not a boycott. It is a costume.

I don't say that to score a point. I say it because it changes the question. "Should we use AI" was settled around 2010 without anybody asking us. The live question is what kind, run how, paid for by whom, and answerable to whom. That is a question worth fighting about.

## Different, but the same

I have been tinkering with computers since before the Web, back when the internet was a handful of bulletin boards and a modem that screamed at you. I have watched three or four of these waves now, and I have read about the ones before me. Every major technology since the late 1800s has arrived the same way: real harm, real fear, real benefit, and then a long fight to keep the benefit and cut the harm. Different, but the same.

Electricity killed linemen and burned down buildings, and the companies that owned it had no interest in running wires to farms that could not pay. In 1936 only about one rural household in ten had power. It took the Rural Electrification Act, federal loans and cooperatives, to change that [5]. Nobody solved it by refusing to use lights.

The automobile killed people at a rate we would not tolerate today. The fix was not fewer cars. It was the National Traffic and Motor Vehicle Safety Act of 1966, which forced manufacturers to meet safety standards, and the fatality rate per mile driven fell by 71 percent between 1967 and 2001 [6].

Radio was chaos in the 1920s, stations stepping on each other, nobody in charge, until the Radio Act of 1927 and then the Communications Act of 1934 established that the airwaves belonged to the public [7]. The internet itself brought a flood of spam and fraud, and Congress answered with CAN-SPAM in 2003 [8]. It did not end spam. It gave us a lever.

Notice the pattern. In every case the fix came from three places: engineering that made the thing safer and cheaper, law that made the harm expensive, and people who showed up and pushed. Not once did it come from pretending the machine did not exist.

## The dangers, taken seriously

So let's take his objections one at a time, with numbers.

**Power.** The International Energy Agency puts global data center electricity use at about 415 terawatt-hours in 2024, roughly 1.5 percent of the world's electricity, and projects it will more than double to about 945 by 2030, with AI the biggest driver [9]. In the United States, Lawrence Berkeley National Laboratory found data centers used 4.4 percent of the nation's electricity in 2023 and could reach somewhere between 6.7 and 12 percent by 2028 [10]. That is a real load on a grid that was not built for it. Virginia's own legislative auditors reported in December 2024 that Northern Virginia's data centers already draw over 4,000 megawatts, more than any other market in the world, and that the state's demand is expected to double in fifteen years [11].

**Water.** Cooling those buildings takes water, a lot of it, and the companies have historically been quiet about how much. Google's own 2025 environmental report put its data centers' consumption at 7.7 billion gallons in 2024 [12]. The researchers who first made the industry own this number, Pengfei Li and colleagues at UC Riverside, estimated that training one large model in Microsoft's US data centers could evaporate about 700,000 liters of fresh water [13]. In a dry county, that matters.

**Land and communities.** This is the one my nephew feels most, and he has a point. In Memphis, xAI ran dozens of gas turbines beside a largely Black neighborhood before it had a permit for them, and the county health department granted the permit anyway after more than 1,700 public comments, most in opposition. The NAACP is appealing [14]. That is what "stealing land from communities" looks like in practice: a facility that arrives with power it did not have to earn and pollution the neighbors did not agree to.

**Other people's work.** The models were trained on books, articles and images that nobody licensed. That is not a rumor. In 2025 Anthropic agreed to pay 1.5 billion dollars to settle a class action over books it had downloaded from pirate sites, about 3,000 dollars per work, the largest copyright settlement in American history [15]. The New York Times' case against OpenAI and Microsoft survived a motion to dismiss and is still moving toward trial [16]. A British court threw out Getty's copyright claims against Stability AI on narrow grounds without ever deciding whether training on copyrighted images is legal [17]. The law is unsettled, and the companies knew it when they did it.

**Jobs.** Stanford researchers looking at payroll data for 25 million workers found no economy-wide displacement, but they did find that workers aged 22 to 25 in the most AI-exposed jobs, like software and customer service, saw employment fall about 13 percent relative to their peers after late 2022, mostly through reduced hiring rather than layoffs. A year later that gap had widened to 19 percent [18]. If you are his age, that number is the whole argument, and I will not pretend otherwise.

**Scams and slop.** The FBI logged 16.6 billion dollars in reported internet crime losses in 2024, up a third in a year [19]. An engineering firm in Hong Kong lost 25 million dollars to a video call in which every other face on the screen was a deepfake of a real colleague [20]. And every one of us has waded through the garbage that the cheap version of this technology produces.

That is the honest ledger. Anyone who tells you AI is all upside is selling something.

## What is being done, and what is likely to matter

Now the other column, and I want to be as specific here as I was above, because "they're working on it" is not an argument.

**The energy per use is falling fast.** Google measured the median text prompt to its Gemini app at 0.24 watt-hours, 0.26 milliliters of water, and 0.03 grams of carbon, and reported that over the twelve months to May 2025 the energy per prompt fell 33 times and the carbon 44 times, from better chips and better software [21]. Be careful with that number: it is one company's median for one kind of request, and the total keeps growing because use keeps growing. But the direction is real. Weather forecasting is the cleanest example. The European Centre for Medium-Range Weather Forecasts put a machine learning model into full operation in February 2025 that beats its physics-based model on many measures, including hurricane tracks, using roughly a thousandth of the energy per forecast [22].

**Cleaner power is being bought, and dirtier power is being fought.** Microsoft signed a twenty-year deal in September 2024 to restart the Three Mile Island Unit 1 reactor, 835 megawatts of carbon-free power, specifically to match its data center load in the mid-Atlantic grid [23]. That is the good version. Memphis is the bad version. Both are happening, and which one wins in your county depends on who shows up at the permit hearing.

**Water is a design problem, and it is being designed out.** In December 2024 Microsoft announced that every new data center it designs runs a closed loop and evaporates no water for cooling, saving more than 125 million liters per site per year, at the cost of a bit more electricity [24]. Google says it will replenish more freshwater than it consumes by 2030 [12]. Promises, yes. Also engineering that exists today and can be written into a zoning approval.

**Communities are winning some of these.** In August 2025 the Tucson city council voted unanimously to reject a 290-acre data center campus after residents packed the hearings over water [25]. A year later Pima County moved toward a moratorium on new data centers until its zoning code catches up [26]. Arizona's governor put a three-year hold on new tax breaks for them. The land does not have to be given away. It is given away when nobody objects.

**The law is arriving.** The European Union's AI Act came into force in August 2024, with its main obligations landing in August 2026 [27]. Colorado passed the first broad state AI law in 2024, delayed it, then replaced it in 2026 with a revised version taking effect in 2027 [28]. Slow, imperfect, and exactly how it went with cars and radio.

**The "stealing" is turning into a market.** The Associated Press licensed its archive to OpenAI in 2023. Reddit sold Google access to its posts for about 60 million dollars a year. News Corp signed a deal reportedly worth 250 million dollars over five years [29]. Alongside the lawsuits, that is what a correction looks like: the people whose work was taken start getting paid, and the companies that cut corners pay for it in court.

Now the part he will not like. Here is what is not going to move any of this: an individual boycott of a technology that is already inside your email, your bank and your feed. It feels like something. It changes nothing on the grid in Loudoun County or the air in South Memphis. What moves those is boring and local: showing up at the county commission, demanding the water numbers in writing, backing the disclosure laws, insisting that a facility bring its own clean power, and voting for people who will say no to a turbine farm next to a neighborhood. The companies respond to cost. Make the harm cost something.

## The benefits, plainly

I said I would be honest about the harm. I get to be honest about this too.

In 2024 the Nobel Prize in Chemistry went to David Baker for computational protein design and to Demis Hassabis and John Jumper for AlphaFold, a model that predicted the structure of essentially every protein science has cataloged, about 200 million of them, and that more than two million researchers in 190 countries had used by that October [30]. Protein structure was a fifty-year problem. That is drug discovery, vaccines, enzymes that break down plastic. It is not hypothetical.

The weather model I mentioned is already giving better hurricane tracks to people who live where hurricanes land. Live captions and screen readers have made the internet usable for people who were shut out of it. Translation that works in real time has made it possible for my wife and me to correspond with breeders overseas about dogs and pedigrees without a dictionary on the desk.

And there is my own small case. I run a Shiba Inu breeding program with my wife, and the software that tracks our dogs, their health testing, their litters and their pedigrees was built with AI doing much of the typing while I did the deciding. It is also being used to fix problems AI itself created: the models that route power on the grid, that cut a data center's cooling load, that flag the deepfake before the money moves. A technology that can be turned on its own mess is a technology worth keeping.

## On the politics

My nephew's last objection is that the current administration is loudly pro-AI, and he does not trust anything they are for. I understand the instinct. But look at the timeline. The Biden administration issued a sweeping AI executive order in October 2023. The Trump administration rescinded it on January 20, 2025, signed its own three days later, and released an action plan in July 2025 [31]. Meanwhile the European Union wrote a law neither of them had a hand in, and China is building as fast as anyone. This technology was here before this administration and will be here after it. Opposing a tool because a politician likes it is a poor compass; it hands the decisions to the people you distrust. Judge the policies. Fight the permit. Keep the tool.

## Where that leaves us

So here is what I would ask of him, and what I will hold myself to.

I would ask him to keep every one of his objections and aim them where they can land: at the siting decisions, the water reporting, the air permits, the hiring practices, and the disclosure laws. Those are winnable, and the Tucson vote proves it. I would ask him to stop treating the word "AI" as a single thing to be for or against, because the spam filter, the hurricane model and the gas turbine in Memphis are not one thing.

For my part, I will keep building with it and keep saying out loud what it costs. I will pay for the data I use where there is someone to pay. I will not pretend the median prompt is the whole bill. And when the county commission here takes up a data center, I will be in the room.

Every big machine since the light bulb has arrived dangerous, expensive and owned by the wrong people, and every one of them was brought to heel by engineers, lawmakers and neighbors who refused to either worship it or wish it away. This one is different. It is also the same.

## References

1. TechCrunch, "Google says its machine learning tech now blocks 99.9% of Gmail spam and phishing messages," May 31, 2017. https://techcrunch.com/2017/05/31/google-says-its-machine-learning-tech-now-blocks-99-9-of-gmail-spam-and-phishing-messages/
2. Google, "How AI powers great search results." https://blog.google/products-and-platforms/products/search/how-ai-powers-great-search-results/
3. CNBC, "How Visa employed artificial intelligence to check $40 billion in fraud as scammers also take to AI," July 26, 2024. https://www.cnbc.com/2024/07/26/ai-and-machine-learning-helped-visa-combat-40-billion-in-fraud-activity.html
4. TechCrunch, "Zuckerberg: AI increased the time spent on Facebook and Instagram in Q2," July 30, 2025. https://techcrunch.com/2025/07/30/zuckerberg-ai-increased-the-time-spent-on-facebook-and-instagram-in-q2/
5. National Park Service, "Rural Electrification Act." https://nps.gov/home/learn/historyculture/ruralelect.htm
6. Federal Highway Administration, "A Moment in Time: Highway Safety Breakthrough." https://www.fhwa.dot.gov/highwayhistory/moment/highway_safety_breakthrough.cfm
7. Britannica, "Radio Act of 1927" and "Communications Act of 1934." https://www.britannica.com/topic/Radio-Act-United-States-1927 and https://www.britannica.com/event/Communications-Act-of-1934
8. Federal Trade Commission, "CAN-SPAM Act of 2003." https://www.ftc.gov/legal-library/browse/statutes/controlling-assault-non-solicited-pornography-marketing-act-2003-can-spam-act
9. International Energy Agency, "Energy and AI," executive summary, April 2025. https://www.iea.org/reports/energy-and-ai/executive-summary
10. Lawrence Berkeley National Laboratory, "2024 United States Data Center Energy Usage Report," December 2024. https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report_1.pdf
11. Virginia Joint Legislative Audit and Review Commission, "Data Centers in Virginia," December 9, 2024. https://jlarc.virginia.gov/landing-2024-data-centers-in-virginia.asp
12. Latitude Media, "Data center water use can be a 'black box.' Google aims to change that," 2025, reporting Google's 2025 Environmental Report. https://www.latitudemedia.com/news/data-center-water-use-black-box-google-trying-to-change/
13. Li, Yang, Islam and Ren, "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models," 2023. https://arxiv.org/pdf/2304.03271
14. Inside Climate News, "In South Memphis, Elon Musk's Colossus Operated Gas Turbines Without Appropriate Permits, Residents and Activists Claim," July 2025, and Tennessee Lookout, "NAACP, others appeal xAI turbine permits." https://insideclimatenews.org/news/17072025/elon-musk-xai-data-center-gas-turbines-memphis/ and https://tennesseelookout.com/briefs/naacp-others-appeal-xai-turbine-permits-for-memphis-data-center/
15. CNBC, "Judge in Anthropic case gives preliminary OK to $1.5B settlement with authors," September 25, 2025. https://www.cnbc.com/2025/09/25/judge-anthropic-case-preliminary-ok-to-1point5b-settlement-with-authors.html
16. NPR, "New York Times' OpenAI copyright case goes forward," March 26, 2025, and Axios, "Historic NYT v. OpenAI copyright battle heats up," September 8, 2026. https://npr.org/2025/03/26/nx-s1-5288157/new-york-times-openai-copyright-case-goes-forward and https://www.axios.com/2026/09/08/nyt-openai-microsoft-copyright-lawsuit
17. Latham & Watkins, "Getty Images v. Stability AI: English High Court Rejects Secondary Copyright Claim," November 2025. https://www.lw.com/en/insights/getty-images-v-stability-ai-english-high-court-rejects-secondary-copyright-claim
18. Brynjolfsson, Chandar and Chen, "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence," Stanford Digital Economy Lab, August 2025, and the August 2026 update. https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/ and https://digitaleconomy.stanford.edu/news/canariesaug26/
19. FBI Internet Crime Complaint Center, "2024 Internet Crime Report." https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf
20. CNN, "Arup revealed as victim of $25 million deepfake scam involving Hong Kong employee," May 16, 2024. https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk
21. Google Cloud, "Measuring the environmental impact of AI inference," August 2025. https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference
22. ECMWF, "ECMWF's AI forecasts become operational," February 2025. https://www.ecmwf.int/en/about/media-centre/news/2025/ecmwfs-ai-forecasts-become-operational
23. Constellation, "Constellation to Launch Crane Clean Energy Center," September 20, 2024. https://www.constellationenergy.com/news/2024/Constellation-to-Launch-Crane-Clean-Energy-Center-Restoring-Jobs-and-Carbon-Free-Power-to-The-Grid.html
24. Microsoft, "Sustainable by design: Next-generation datacenters consume zero water for cooling," December 9, 2024. https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/12/09/sustainable-by-design-next-generation-datacenters-consume-zero-water-for-cooling/
25. AZ Luminaria, "Tucson City Council rejects Project Blue data center amid intense community pressure," August 6, 2025. https://azluminaria.org/2025/08/06/tucson-city-council-rejects-project-blue-amid-intense-community-pressure/
26. AZ Luminaria, "Pima County moves toward data center moratorium, tighter transparency," August 12, 2026. https://azluminaria.org/2026/08/12/pima-county-moves-toward-data-center-moratorium-tighter-transparency/
27. EU Artificial Intelligence Act, "Implementation Timeline." https://artificialintelligenceact.eu/implementation-timeline/
28. Colorado General Assembly, SB24-205 and SB26-189. https://leg.colorado.gov/bills/sb24-205 and https://leg.colorado.gov/bills/sb26-189
29. Axios, "AP strikes news-sharing and tech deal with OpenAI," July 13, 2023; Fortune, "Reddit's $60M deal with Google," February 23, 2024; Variety, "News Corp Inks OpenAI Licensing Deal Potentially Worth More Than $250 Million," May 2024. https://axios.com/2023/07/13/ap-openai-news-sharing-tech-deal and https://fortune.com/2024/02/23/reddit-60m-deal-google-search-giant-train-ai-models-on-posts and https://variety.com/2024/digital/news/news-corp-openai-licensing-deal-1236013734/
30. The Nobel Prize, "The Nobel Prize in Chemistry 2024," press release and popular information. https://www.nobelprize.org/prizes/chemistry/2024/press-release/
31. Federal Register, "Initial Rescissions of Harmful Executive Orders and Actions," January 2025; Jones Day, "White House Issues Executive Orders on AI Action Plan," August 2025. https://www.federalregister.gov/documents/2025/01/28/2025-01901/initial-rescissions-of-harmful-executive-orders-and-actions and https://www.jonesday.com/en/insights/2025/08/white-house-issues-executive-orders-on-ai-action-plan
