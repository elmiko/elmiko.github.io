---
layout: solo
title: In Support of Human Cognition
---

# **In Support of Human Cognition**

<br>

> “Once men turned their thinking over to machines in the hope that this would set them free. But that only permitted other men with machines to enslave them.”
>
> Frank Herbert, Dune

<br>

As the advancement of artificial intelligence technology continues to grow, many who practice the craft of computer programming are being impacted; most notably the future generations who will inherit the fruits of these labors.

I write this open letter to reflect on my experiences with the evolving world of software development and to meditate on the things that inspired me to educate myself about computers for most of my life.

I am also compelled to share the less formal techniques and wisdom that I have acquired and to call on my fellows to do the same and to join in promoting human cognition.

## Museums and Curiosity

I’ve visited several museums recently, and while at the Harvard Museum of Natural Science I had an experience that awoke something deep within me. It was a rainy day, and many families were at the museum that day. While wandering the collections of crystals, flowers, animals, and cultural artifacts I was struck by how many children were excited to be asking all manner of questions.

The realization of the exuberance of curiosity that was overflowing all around made me remember my earliest days with computers. When I was young, personal computers were a relatively new thing. To have access to a computer was special and the programs and interfaces were designed in ways that provoked the curiosity of a young person.

It was in this fertile, inviting, bed of exploration that I started learning more about computer programming, mathematics, and the science of computation. I was never a good student, but this understanding of computers completely consumed me. I would spend hours in the computer lab creating ephemeral digital architectures which, like castles made of sand, would be erased by the time I awoke the next day. Nonetheless I persisted, with graph paper in tow, and the energy that only a preteen can muster, to complete my Sisyphean task. 

At seeing the children in the museum, I was shook. Wondering how I could lend my hand to refuel the fires of inspiration and curiosity in our society for people who feel passionate about computing. 

## Building Muscle Memory

A story that my father loves to tell is about how he bought our family an Apple _IIe_ computer. This was in the 1980s and there were very few, if any, computer sales stores in the metropolitan Detroit area. So, he did what any father would and bought the whole computer out of car trunk, in a parking lot, from a local computer enthusiast who had a license to resell Apple hardware.

That computer changed our family. Immediately my brothers and I were enthralled by all the games we could get our hands on. My mother, a mathematics teacher who already knew Pascal, tried to get us to play educational games, but we quickly moved on to more _stimulating_ affairs. For me though, I was intrigued by the command prompt that appeared when you booted the computer. I was familiar with BASIC and quickly started learning more about how to _peek_ and _poke_ the hardware of that machine.

Over time, I learned to find source code in the magazines of the era. I would copy them line for line into our computer, fixing problems, and adding functionality as my mind drew me onward. These exercises became my earliest programming experiences, even though they were mostly rote copying blended with a little imagination. In many ways, I do not consider the activities I pursued back in those days as much different than programmers today who utilize artificial intelligence to generate source code. The main exception being the manual copying and pasting that I did, which I feel was important to developing my perceptions of code that I consider as high quality.

As the years progressed, I continued to learn more about the hardware and software of computers. All the while practicing the manual craft of typing programs by hand, like the monastics of old copying the holy texts for future generations. Eventually, I gained enough confidence and experience to require less input to stimulate my typing. I would simply code directly from my thoughts, as if speaking in a foreign language (although I’ve always been horrible at spoken languages).

I believe that the practice of imitating other’s source code, experimenting with the outputs, and breaking and fixing problems has been foundational to my current understanding of computer programming. I don’t say this to insist that others follow my path, but to highlight one of the things that I feel has led me to my current place. In many respects I view this activity as my _code kata_, helping me to maintain the muscles and reflexes I have built over decades of practice.

More than my belief in these practices though, there is ample evidence to support the positive benefits of these exercises and the risk of reliance on artificial intelligence. On an anecdotal level, the phrase “chop wood, carry water” is used frequently in open source communities to describe the types of activities that are sought in highly impactful contributors. This phrase has deep roots in the idea of the communal strength of performing necessary work that is often seen as unglamorous.  On a more formal level, just one example is a recently released study from the University of California in Berkeley that found spending just 10 minutes relying on an artificial intelligence tool significantly impairs our ability to focus and persist with difficult tasks. And on a personal level, for anyone who has engaged in physical exercise we are all familiar with the near-axiomatic phrase “no pain, no gain”.

I know that Apple _IIe_ was expensive, my dad likes to remind me about it. But, he also likes to tell me that it was the best investment he ever made. My investment of time in my _code katas_ may seem expensive in the short term, but it’s one of the best investments I have ever made. I want to make that investment for future generations of computer programmers.

## The Tragedy of Therac-25

I’ve been retelling the story of Therac-25 frequently as of late, and discussing its implications. I’m surprised by the number of people who have never heard about this device and the resulting tragedy its manufacturers created. When I was in college, the story of Therac-25 was important history for everyone to understand; in the era of artificial intelligence I feel it’s all the more important.

Therac-25 was a radiation therapy device invented in 1982 and preceded by the Therac-20 and Therac-6 models. All three devices utilized a DEC PDP11 to control their operation, but unlike its predecessors the Therac-25 had been explicitly designed to be computer controlled. Two notable changes with the new device were the combined treatment modes that reduced the number of different devices required, and security checks being moved from hardware to software. Additionally some source code from the previous devices were reused in the Therac-25, which was later revealed to have been unknown by the quality assurance manager. In 1983, Therac-25’s manufacturer performed a safety analysis on it using a fault tree that did not appear to include the software, ultimately concluding that any errors which could arise would be due to faulty hardware.

Between 1985 and 1987, usage of the Therac-25 resulted in the accidental deaths of at least six people related to radiation overdose. During this window in time, the manufacturer’s response to the growing number of incidents was to implicate hardware problems and user error as the root causes for the overdoses. Despite insistence from its users to the opposite, the manufacturer remained firm that they could not reproduce the error and that it must be hardware related. In a retrospective analysis, it was concluded that errors which existed in the Therac-20’s software had been brought to the Therac-25. And that those errors were only minor inconveniences for Therac-20 users as the hardware safeguards prevented harm in patients.

Therac-25 was recalled in 1987. During the investigation of the resulting deaths and the analysis of the device’s failure, it was determined that poor software development practices in combination with replacing hardware safety checks in favor of software checks were the ultimate culprits of this tragedy. The exact means of the software bugs that led to the deaths are not important to the larger issue of software design flaws and the unsafe development practices which led to the tragedy. Therac-25 became a case study in software design practices and computer ethics leading to a reexamination of how we teach these topics.

In my day job, I interact with many of my employer’s largest customers. Helping them to solve problems with distributed systems in highly networked environments, usually at large scale as well. I am seeing how artificial intelligence is entering the area of triage and diagnosis of software systems, and I have mixed feelings about it. On one hand, I am happy that people who are unfamiliar with a specific subject are able to gain a quick understanding of the basics. But, I am also unhappy about the notion that artificial intelligence tools are trusted as the default, sometimes over people with deep experience of the systems at question.

As I watch the advancement of artificial intelligence in computer programming I cannot help but be reminded of my schooling around Therac-25 and its warnings. I deeply appreciate the excitement that this new technology brings. I’ve spent nearly my entire life looking forward towards the future of technology, it feels strange to call for pause in this moment. That said, I feel we should be measured in our pursuits and take care not to lose the hard-won knowledge we’ve gained.

To be clear, I do not predict some specific impending tragedy due to our use of artificial intelligence. But, I am greatly concerned that we are creating the conditions for another Therac-25, and given the state of our increasingly interconnected world the possibility for harm is high. If you don’t believe me, look towards Anthropic, OpenAI, and others who are already planning for, and privately gaming out, catastrophic events related to their technologies. I hope that we unlock a powerful tool to benefit all of humanity. But with that said, we must consider the methods of our learning, the means of exercise for our knowledge, and the application of our cognition. We would be wise to remember our fellows and the implications of our choices when deploying any technology en masse.

## Humans in the Loop

A phrase I hear frequently these days is “human in the loop”. It is nearly always used as some sort of bargaining chip to gain the confidence of workers who are being encouraged to use artificial intelligence technologies. In the beginning I was happy to hear this phrase, but the more I’ve thought about it, the more I am becoming uncomfortable with the way it is being employed.

For me, the phrase “there must always be a human in the loop” sounds like the a bargaining point between workers and their leadership. From the workers’ perspective, there is no bargaining to be made, only a position that they could retreat from. From the leadership position, there is infinite room to erode the workers’ rights to be involved in their labor. Since “human in the loop” is the point of contention, that means every argument will be about where in the loop they should be, what they are responsible for, and where they must provide accountability.

Instead, I would prefer to begin this conversation from the point that there is a growing body of research which demonstrates cognitive atrophy and skill loss within populations that make heavy use of artificial intelligence. We should consider artificial intelligence technology with skepticism and scrutiny until it can be proven safe for general consumption. Cory Doctorow has famously said “AI is the asbestos we are shoveling into the walls of our society and our descendants will be digging it out for generations”, and I agree. I think then, that it is important for us to start the _bargaining_ about how much artificial intelligence we use in our work with the position that it is harmful to human mental health and we should protect ourselves properly as we integrate it into our civilization.

I spend a good portion of my time these days in mentoring activities and listening to what my colleagues are saying about how artificial intelligence is impacting their careers. One thing that comes up often in the groups I mentor is the notion of wanting to know more about the lower layers of programming, but not being afforded the opportunities to do that exploration. Many people talk about increased velocity and workload demands from their leadership structures, predicated by the notion that artificial intelligence will make their work easier and thus they can handle more.

Another topic that I see in my work, and that my colleagues who work more directly with the programming of artificial intelligence tell me about, is the trust factor. The error rates of artificial intelligence accuracy are high enough that any software manufacturer would reject the technology outright if it weren’t for the incredibly inflated hype cycle being driven by the profiteers of this technology. Combine those error rates with workers who are forced to use the technology, and you end up with a workforce that is almost in active rebellion. I am approached by colleagues on a near weekly basis for coaching about how they can migrate away from their current roles to ones with teams that are not being forced to use artificial intelligence. 

There is a strong desire and curiosity from people entering the world of computer programming to understand what is being created by artificial intelligence. There is also an implicit awareness of the changes this technology is imposing on our mental health, and also of the opportunities for learning it is robbing from us. We must endeavor to create healthy work environments for our colleagues, while also passing on the wisdom we have gained through experience. With the advent of artificial intelligence, the responsibility of senior programmers needs to change its focus to more heavily expose the reasons behind decision making and not simply the methods.

## A Call

I hope I have been clear, through the lens of allegory, about how I feel about the dawn of artificial intelligence. To be explicit though, I am not against artificial intelligence technology. I have personally gained benefit from the code parsing and review tools that have become available due to large language models. I have watched peers whom I respect deeply use generative technology to create massive architectures that would take my aging fingers months to type by hand. And I have also watched my junior colleagues accelerate their knowledge of mature code bases through deep conversational interactions with agentic workflows. These tools do and will continue to have value.

This leaves us with a choice about how we define the future. I want to implore my fellows who currently occupy the titles of seniority in the software industry to consider how they teach future generations. Instead of relying on the knowledge that is stored within artificial intelligences as the primary source of truth, we should be focusing on the thought patterns which bring us to decisions. Describe why one thing looks correct, and another wrong. Expose your methods for how you arrived at your current understanding of computers and programming. Invite your junior colleagues to understand your ways. We need to encourage future generations to look towards the moon, instead of focusing on the finger pointing towards it.

I’d like to leave with one final story. When I was growing up through the 1970s and 1980s we were taught about the depletion of the ozone layer around the Earth. We learned about the hole in the ozone layer that was growing. How it was allowing more ultraviolet light through to the surface, heating up the environment, and leading to direct human damage like increased skin cancer rates. The reason for the depletion was directly related to our daily use of various refrigerants, solvents, and other similar chemicals that we manufacture. Due to this new understanding, public policy changed, and we as a species worked to reduce our usage of the damaging chemicals to a minimum. Today, many people   denigrate the environmentalist movement by referring to the ozone layer crisis as a _cause celebre_ of the day, and that we no longer hear about the damage. What they fail to acknowledge is that the reason we don’t talk about it anymore is because we worked to change our ways and healed some of the damage that was done. Whether it’s the ozone layer, the Y2K problem, or even artificial intelligence, we have the power to act responsibility in defense of our health and our survival. 

I hope to accomplish two things in writing this expression of my thoughts:

* To stand on the record about how I feel with regards to the way we are using artificial intelligence technology and the effect it is having on the craft of computer programming.
* To ask my colleagues, peers, and fellows to consider how they are advancing the art of computer programming, to strive towards creating healthy work environments, and to ensure the survival of human cognition in computing by sharing their wisdom and providing the time and freedom for future generations to flourish.

Signed,

Michael McCune

<br>


_If you feel compelled by this call and would like to stay in touch or would like to add your signature to this letter, please reach out via email at [humancognition@elmiko.dev]._

[humancognition@elmiko.dev]: mailto:humancognition@elmiko.dev
