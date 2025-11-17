---
layout: post
title: "KubeCon North America 2025 Retrospective"
subtitle:  ""
date: 2025-11-17
categories:
---

Well, it's been about a year since I updated this blog, so why not get back into things by giving my
retrospective on this fall's KubeCon North America. TL;DR fewer people, slightly less AI hype, and
loads of good conversations.

KubeCon North America for 2025 was hosted in Atlanta Georgia in the United States. The offical "KubeCon"
was on the 11th through the 13th of Novmeber, with the CNCF co-located events happening on Monday the
10th, and the Kubernetes Maintainer Summit happening on Sunday the 9th. I was lucky enough to travel to
Atlanta for all the events, but the start of my journey was slightly delayed due to the government shutdown
in the United States. It's worth mentioning the political activity in the United States, without going into
too much detail, as I believe the current political climage contributed to the perceived smaller population
at this KubeCon.

But, even though my flight was delayed by 6 hours, I was able to finally make it to Atlanta. I heard stories
from many friends and colleagues who had flights delayed, and some cases cancelled, which led to a fun situation
where most of us were asking each other "how long was your delay?" as we met at the conference.

<img src="/img/kubecon-na-2025-selfie.jpg" class="img-responsive center-block" alt="Selfie at Red Hat booth">

## Kubernetes Maintainer Summit, Sunday November 9

As is tradition, maintainer summit is my favorite part of the conference. This year, we started with the summit
occurring before any other event. There was a small gathering at the conference hall and we had a day of
conversations, presentations, and unconference sessions; this year including a hot meal for lunch! (thank you con team <3)

We started with the keynotes and getting warmed up for the day, it's always nice starting out with some laughs
and looking around the room to see who you might recognize. As I noted, the attendance seemed a little lower
than previous summits and some of that was due to the travel challenges, and the rest I believe was due to folks
not wanting to engage with the United States customs and border control.

I started my summit by attending the [TAG Workshop][tagworkshop] hosted by Karena Angell, Mario Fahlandt, Brandt Keller,
and Dylan Page. TAG stands for "Technical Advisory Groups" and this was my first experience learning how these groups
operate and what function they serve in the community. I was glad to learn that they help with cross-project efforts
and in areas where greater coordination is needed for initiatives that will affect several technology groups. A large
part of the reason I wanted to learn more about the TAGs is that [the testing work I am interested in doing][sigcptalk]
is going to involve some level of standardizing around how Kubernetes is deployed for different cloud providers, something
we have been calling "distributions" in SIG Cloud Provider.

As happens at these events, the discussion I was having about kubernetes distributions continued past the end time for
the TAG Workshop and I ended up spending my next session in the _hallway track_ talking with folks about the idea. Basically,
it would be very convenient for cloud provider testing to have the notion of a _distribution_ of kubernetes. This would mean
including a reference topology (eg 3 control plane nodes instead of 1, etc) and also including provider-specific components
depending on the distribution. For example, on OpenStack, the kubernetes distribution would include the cloud controller manager
for OpenStack, plus any other storage or networking components required for that platform. This would help us in arriving
at a destination where tests could more easily select the platform and also the components that need testing. In the end
we will have provider agnostic tests that can operate on any provider, but which will also exercise provider-specific behavior
through provider interfaces.

After lunch, I went to some of the unconference sessions starting with
[Better Together, Strengthening Inter-Project Collaboration & Developer Experience Across the CNCF Ecosystem][bettertogether]
proposed by Yacine Kheddache and Colin Griffin. This was a fun session where we talked about how to better share
information in the CNCF community, especially for the purposes of helping increase cross-project collaboration and knowledge.
As with many unconference sessions, the discussion really got going once the time was almost out, but I had a revelation while
participating in the discussion. Essentially, we could use more project manager community members. This is something I have
struggled with in the past, but it was purely based on people reaching out to me for mentorship as project managers. I never
had a good answer for this style of collaboration in open source projects, but in this Kubernetes community I am now seeing
a clear place for these roles. In the future I am going to guide project managers to become more involved in the _social glue_
that holds our community together. I think there is a strong place for contribution in the form of people who can go between
projects to help advocate for projects needs in differing venues. _Perhaps another blog post topic for the future ;)_

The last session I attended was the one on [Making the Kubernetes CI/Infra better][cibetter]. Now, this wasn't technically the
last session of the day, but the discussion I got into towards the end kept going into the hallway track, and by the time we
were done it was picture time. This session was great though, especially given my desire to chase the idea of Kubernetes
distributions. I learned a lot in this session and came away with a new excitement about building a Cluster API deployer for
[kubetest2][kb2]. We'll see where it goes, but I'm optimistic about the future of Kubernetes cloud provider testing.

After a day of visiting with colleagues and talking about the future of Kubernetes we adjourned for some much needed relaxation.

## OpenShift Commons and co-located events, Monday November 10

It's going to be a big week, so I need to start with a solid breakfast. We don't have Waffle House in my state (Michigan), and
it is a national institution so I had to visit. _(I actually went almost every day XD)_
<img src="/img/kubecon-na-2025-wh.jpg" class="img-responsive center-block" alt="Waffle House">

On Monday, I had the pleasure of visiting [OpenShift Commons][commons] as an attendee instead of a speaker or employee, which
was a change from previous years. I love the Commons and as a Red Hat event I always feel a little like a celebrity when
I visit. I was able to spend some face time with colleagues and even got to talk with a customer or two. It is very gratifying
to hear about our customers' journeys and how our efforts become solutions for them.

After spending the morning at Commons, I returned to the convention center to watch my teammate Mansi Kulkarni give
a talk on [Windows Container Monitoring Demystified: OpenTelemetry in Action][winmon] with her peer Ritika Gupta. As
I don't normally work on this area of Kubernetes, it was interesting to hear how Windows containers work and also
how they are monitored by users. It's a wild world combining container technology with the Windows kernel.

I didn't have a ton going on Monday aside from catching up with folks, so I spent some time reading code and planning
for KubeCon proper.

## KubeCon Day 1, Tuesday November 11

After the keynotes, I availed myself of a walk through the exhibitor hall and then found some talks to watch. I also
stopped many times in the hallway track to catch up with folks I had not seen in several months.

One of the big talks on Tuesday was Corey Quinn's [The Myth of Portability: Why Your Cloud Native App Is Married To Your Provider][myth].
I was only a little familiar with Corey's work and I was not at all ready for his presentation style. This talk was well polished, and
well delivered. Corey has a unique style that trends more towards comedy than analysis. His message was astute though, about the
intracacies and challenges of delivering applications in hybrid environments and what it means to make an application truly portable
across clouds. I found his analysis of the problem to be spot on, his solutions left me wanting more though, and his delivery was downright
mean-spirited. While he made good points, I couldn't help but feel insulted as he emphasized again and again how the work of myself and
my peers was "shit".

Thankfully, after the mean-spirited pillory of the previous talk, I was delighted to see Taylor Dolezal and Erica Hughberg's talk
[The Missing Manual for Open Source Community Sustainability][manual]. I found this talk energizing and informative about how we
build more sustainable processes into our communities. I really enjoyed how Taylor and Erica broke down the personas within software
communities, and then provided techniques for engaging with those people. I left with a full page of notes from this session.

The last session I attended on Tuesday was [Beyond the Code: How the Kubernetes Steering Committee Tackles the Hard, Non-Technical Problems][beyond]
hosted by Antonio Ojea, Benjamin Elder, and Maciej Szulik. I have been curious about the steering committee and how they work and this
session delivered exactly what I desired. I learned a great deal about how the committee is structured in relation to the SIGs and WGs,
and also how they operate. It was nice to hear stories from the current committee members about how they ran for election and what the
experience has been like for them. Also, very cool to hear how the kubernetes community keeps itself healthy and on-track.

<img src="/img/kubecon-na-2025-powertrio.jpg" class="img-responsive center-block" alt="Antonio, Ben, and Maciej">
Antonio, Ben, and Maciej, what a kubernetes power trio!

## KubeCon Day 2, Wednesday November 12

Wednesday was a big day for me as I was part of a talk, so I spent the morning preparing. At 11:30am it was time for us to present
[Maximizing Global Potential: Cost-Optimized, High-Availability Workloads Across Regions][ourtalk]. I joined Praseeda Sathaye and
Jingkang Jiang, with shoutouts to Wei Jiang, to present this talk and we had an absolute blast. We talked about how kubernetes can
be deployed globally across regions and providers to deliver highly available infrastructure. We demonstrated how the Karmada,
Cluster API, and Karpenter projects can be utilized to build this type of topology. We had about 60-70 people in the room and got
some good questions.

<img src="/img/kubecon-na-2025-ourtalk.jpg" class="img-responsive center-block" alt="JK, me, Praseeda">
Jingkang, myself, and Praseeda, another power trio!

After our talk, I quickly moved to the [SIG/WG Meet & Greet][mng]. The meet and greet is another of my favorite activities at
KubeCon. It's a great chance to hang out with maintainers and learn about kubernetes and the community, and to pick people's
brains about what is next, or how to get involved. I absolutely recommend it to anyone who wants to learn more about the
maintainer community.

<img src="/img/kubecon-na-2025-mng.jpg" class="img-responsive center-block" alt="SIG meet n greet">
It was so good that the CNCF photographers caught us! ([source][photo])

I was talking with Josh Berkus at the end of the meet and greet and we both noted how the line for the puppy petting event
was very long and also right outside the meet and greet. This could perhaps be a good technique for bring more folks to the meet
and greet next time. Just put the puppy pit at the back of the meet and greet. XD

<img src="/img/kubecon-na-2025-puppy.jpg" class="img-responsive center-block" alt="Puppy pit at kubecon">

Next it was on to see my colleague Jose Valdes co-present with Mark Rosetti on the [Kubernetes SIG Windows Updates][sigwin]. As I
noted earlier, I don't normally work on Windows (although I did in a previous life), but I learned some cool stuff in this presentation
and I got to support my teammate. I find it interesting to learn how Windows is able to meet the OCI standard through its various
process APIs. I'm not sure I'm ready to return to that world (I'm not), but I enjoyed learning more about this corner of the
kubernetes ecosystem.

After all that, I still had some gas left in the tanks and I was eagerly waiting for Justin Santa Barbara and Ciprian Hacman's talk
[The Next Decoupling: From Monolithic Cluster, To Control-Plane With Nodes][decoup]. In this talk, Justin and Ciprian were
discussing some experimentation they would like to do in [kOps][kops] to add more support for Cluster API and Karpenter. I find these
ideas to be exciting and a good path future for improving our testing efforts across platforms. It filled my head with more
thoughts about extending kubetest2 and building a proof of concept on top of their work. Also, they produced a logo for Karpenter
that I absolutely adore, and I want to make it the Karpenter Cluster API logo:

<img src="/img/kubecon-na-2025-karpcapi.jpg" class="img-responsive center-block" alt="Alternate karpenter logo">

wow, what a Wednesday!

## KubeCon Day 3, Thursday November 13

By Thursday I was nearly completely wiped out, but I was part of a panel that would be the last session of the day. So, I pushed forward
and made some connections. I spent most of my day talking with various colleagues about the work we are doing and what we would like
to do in the next 6-12 months.

Then, at the end of the day, I was delighted to join my fellow SIG Cloud Provider co-chair Bridget Kromhout, as well Joel Speed, Walter
Fender, and Jesse Butler to have a panel about [SIG Cloud Provider Deep Dive: Expanding Our Mission][sigcp]. I had a great time and I'm
fairly sure the other speakers did as well. We had a nice chance to talk about how the SIG is working to create cross-platform building
blocks for the future of kubernetes. We had a nice attendence for our event and a good discussion among the panelists. I'm optimistic about
the future, and it seemed like our discussion and energy permeated into the audience with several nice comments directed towards the SIG at
the end.

## Thoughts and takeaways

This KubeCon seemed smaller than years past. I can only assume this was due to travel and the behavior of the government of the
United States. I was nervous to travel, especially given the shutdown and delays, but I am glad I made it. I love seeing my
friends in the community and I generally had a positive experience in Atlanta. I also walked away with many new ideas and that
familiar sense of excitment that percolates when I've got plans a brewing.

Some thoughts I had:
* While "AI" was still big, it seemed less big than previous KubeCons.
* Many of my peers are now using LLM-based solutions for the smaller tasks. Nearly all of these efforts are being forced
  by their employers and the results seem mixed at best.
* Resource allocation and placement is still a _big deal_. There continues to be more and more work done on exposing better
  metadata for workload placement and optimization.
* There is a wealth of younger people looking to become involved with Kubernetes. We need to hire more people!
* Kubernetes is not slowing down, nor does it appear to be entering the maintenance mode just yet.

That's about it from me. Another KubeCon in the books. Hopefully this small report has helped to give one window into KubeCon.
I hope to make to Amsterdam, if you see me come say hi (and don't be surprised if I give a quizical look at first). I'll try
to wear my fedora again, it seemed to be a good way to find me lol. As always, stay safe out there and happy hacking!


<img src="/img/kubecon-na-2025-atlanta.jpg" class="img-responsive center-block" alt="Atlanta">


[tagworkshop]: https://sched.co/2B5Lm
[sigcptalk]: https://www.youtube.com/watch?v=WeWQqQM6kjM
[bettertogether]: https://sched.co/28aDq
[cibetter]: https://sched.co/28aE2
[kb2]: https://github.com/kubernetes-sigs/kubetest2
[commons]: https://commons.openshift.org/
[winmon]: https://sched.co/28D71
[myth]: https://sched.co/27FVz
[manual]: https://sched.co/27FVV
[beyond]: https://sched.co/27NmS
[ourtalk]: https://sched.co/27FZc
[mng]: https://sched.co/28xeb
[photo]: https://www.flickr.com/photos/143247548@N03/54921155691/in/album-72177720330018728
[decoup]: https://sched.co/27Nlp
[kops]: https://github.com/kubernetes/kops
[sigcp]: https://sched.co/27NoX
[sigwin]: https://sched.co/27NoC
