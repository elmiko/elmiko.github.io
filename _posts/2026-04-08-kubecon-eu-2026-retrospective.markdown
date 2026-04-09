---
layout: post
title: "KubeCon Europe 2026 Retrospective"
subtitle:  ""
date: 2026-04-08
categories:
---

As is becoming tradition, here is my bi-annual update to this blog with my thoughts and perceptions
from another KubeCon. This time for the Spring 2026 KubeCon in Europe. TL;DR Lots of
excitement for Kubernetes, more people than Atlanta, AI fatigue is setting in, scheduling is getting
bigger, and as always excellent hallway track conversations.

KubeCon was held at the RAI center in Amsterdam Netherlands this year, the same venue we were at for
KubeCon in 2023. The RAI is a large venue and KubeCon filled it nicely, but not overly so. This year
my schedule was quite packed with the Maintainer Summit happening on Sunday, the Workload Aware Scheduling
Design Summit on Monday, and then KubeCon proper from Tuesday through Thursday. I spoke on two panels
during KubeCon and was generally quite exhausted by the end of the week, but I had a great time and KubeCon
continues to be a great investment of time and energy for me.

As is becoming a sad tradition, the political world is lighting itself on fire as KubeCon is happening, with
the war in Iran being a constant note in the background. Thankfully I did not experience any travel delays
due to the conflict or the continued government shutdowns in the United States. From what I could gather, the
attendance seemed higher than in Atlanta and I have to attribute some of that to people's comfort with
travelling to Europe.

<img src="/img/kubecon-eu-2026-selfie.jpg" class="img-responsive center-block" alt="Selfie out front of RAI">

## Kubernetes Maintainer Summit, Sunday March 22

I started the week with my favorite activity, the Maintainer Summit. I knew going in that the summit was sold out
this year, and it sure felt like it. Every session was packed, there were many hallway conversations happening, and
there was generally a great vibe in the air. Folks were excited to see each other, talk about their projects, and
start doing some face-to-face collaboration. As in the previous edition, the conference committee really listened
to the feedback and we once again had hot meals for lunch and more unconference sessions (although it's always a
sort of mad scramble to get the sessions in and voted on before the afternoon).

After the keynotes, I attended the [Ask the Experts: Kubernetes Steering Committee][ms-steering] session. I've been
keenly curious about the steering committee and these sessions really help to cement my understanding and interest.
As might be expected there were many questions for the representatives about the use of AI technologies in the
Kubernetes development process. I was encouraged by the responses to the questions about AI, in general protecting the humans is
of paramount priority. To support this, there must always be a human in the chain of responsibility when evaluating
issues and pull requests. Further, there was acknowledgement of more and more projects being inundated with generative
LLM contributions. These contributions don't just come in the form of code, they also appear as comments and desciptions
in the various communications channels. There is broad support for any human who feels that they are being
overwhelmed by generative content. I was happy to see such a strong focus on the human element.

<img src="/img/kubecon-eu-2026-capi.jpg" class="img-responsive center-block" alt="Cluster API meetup">

I have been a contributor to the Cluster API project for many years now, mostly as the maintainer for the Cluster
Autoscaler and Karpenter providers, so it was a natural fit that I would attend the [Cluster API Project Meeting][ms-capi]
next. This was a great discussion with the other maintainers and community members where we talked a lot about
CI and a kubetest2 deployer for Cluster API, and also about the low level mechanics of node joining and how that might
become more structured in the future. We talked about what a "conformance" with Cluster API would mean for various
providers and how that relates to the API contracts that the project defines for provider implementers. All in all this
was a great discussion and I always love getting a chance to hang out with the other Cluster API maintainers.

<img src="/img/kubecon-eu-2026-unconference.jpg" class="img-responsive center-block" alt="Maintainer summit unconference voting">

Next up on my schedule, after lunch, were the unconference sessions. There was a little confusion about these sessions
as we vote on them the day of the summit and then the conference committee has to plan where and when they will be.

After a few hiccups, I had found a popular session on [How Should Maintainers Navigate (and Review) AI-based PRs?][ms-unconf1].
This session had a lot of great back and forth between the attendees about how we handle the flood of AI-based
contributions that are hitting CNCF projects. There were many people who shared stories about how their projects are being
affected and it is clear that the focus of contributions is not even across the CNCF landscape. Some of the highlights
from this session were:
* How to handle the honesty issue, are people being truthful about their use of AI?
* Security vulnerabilities introduced by bots, and conversely the attention gained from bug bounty programs.
* Encouraging people to speak in their own voice instead of using an AI for translation.
* Protecting people's time from being focused on overly verbose contributions with low value.
* The possibility of using AI-based tools to help with the volume of PRs.

The discussion was very lively and I was happy to see that many of the points made by the steering committee were being
reinforced organically by the community. Many people are still learning how to navigate this new world of software
development. Some people have had great success and others have experienced terrible failures, but it is clear that as
a community we want to work towards a world where these tools can be used safely and consciously by contributors.

<img src="/img/kubecon-eu-2026-jack-kuba.jpg" class="img-responsive center-block" alt="Maintainer summit unconference voting">

As I mentioned previously, I have been maintaining the Cluster API provider for the Cluster Autoscaler for several years now.
So I was not going to miss Jack and Kuba's session on [Cluster Autoscaler Evolution][ms-cas]. In this session they described
how the Cluster Autoscaler is going to transform to a code model that more closely aligns with how Karpenter is distributed,
namely as a library. I think this is an exciting step forward for the autoscaling community as it will allow the maintainers
to separate the concerns of specific providers from the core behavior. In addition to the library migration there are also
several new features that will be coming to the autoscaler that I think will be eagerly awaited by the community, for one
the ability to defragement clusters. More on these features to come in the months ahead.

With my SIG Cloud Provider hat on, I have been following the Node Lifecycle Working Group's efforts since it began last year.
While I'm not yet convinced there is much work needed to be done by the SIG, I do think it's important to keep touch on
this work as there might be ways that the SIG can help support the new interactions being proposed. To support that, I
went to the unconference session [Node Lifecycle State Needs a Real API][ms-nl], which was a good discussion from the
maintainers of the working group about how we might identify the states needed to improve lifecycle awareness for nodes. It's
a complex issue and I have a feel it will be solved incrementally by addressing the sub-problems, such as eviction, first.

To wrap up the "business" part of my maintainer summit day (as opposed to the after hours party), I attended the SIG Autoscaling
meetup. I was a little late to this session as I had gotten into a deep hallway track discussion about improved ignition
integration in Cluster API. Regardless, I arrived in time to hear the continued discussion about the new architecture for the
autoscaler. This initiative is going to be big for this year and I expect that by the next summit in Salt Lake City much of the
initial work will be complete. Another big topic of discussion for the autoscaling community is the decoupling of the scheduler
from the core of the Cluster Autoscaler and Karpenter projects. There is a new API being developed to help with the workload and
topology aware scheduling that will help this effort and I am very curious to see how it develops.

After the end keynotes, we all gathered for the [maintainer summit group photo][ms-photo] and then on to the socializing with refreshements!
The wandering photographers managed to catch Justin and I deep in a conversation about AI workflows and what the future might
hold.

<img src="/img/kubecon-eu-2026-justin-me.jpg" class="img-responsive center-block" alt="Justin and me talking">

## Workload Aware Scheduling Design Summit at Google, Monday March 23

Coming close on the heels of the Dynamic Resource Allocation (DRA) designs that have helped to improve the state
of advanced hardware utilization in Kubernetes, comes the next big design work: workload aware scheduling. I am thankful to
John Belamaric and Wojciech Tyczynski from Google who organized this design summit where many SIG tech leads and
chairs, as well as interested parties, were invited to participate in architecting the future of Kubernetes scheduling.
This design summit was focused on the myriad problems that need to be addressed so that we can improve the story
around workload awareness during scheduling.

<img src="/img/kubecon-eu-2026-was-summit.jpg" class="img-responsive center-block" alt="John and Wojciech">

Workload aware scheduling speaks to the notion that there are workloads which have greater scheduling constraints than Kubernetes currently
support today. Think about applications where network topology and rack location have an impact on the results. For example, the
machine learning workloads that we see today can often request to have hardware that shares a network segment or in the most
demanding cases might need multiple racks of hardware physically located near each other. The design summit was an opportunity to
have people in one place to discuss the various issues around how the Kubernetes community can deliver these features for users.

The day was separted into a few sessions and was organized in a very unconference fashion. There were two general themes that emerged
from the topics: scheduling and autoscaling. It was difficult for me to pick which tracks I wanted to participate with since I am
representing SIG Cloud Provider to see where we might help with lower level provider interactions, but I also want to keep track of what 
is happening with the autoscaler as I am keenly interested in ensuring that the Cluster API intergrations are as full featured as possible.
In the end, I chose to participate in the scheduling tracks as there were many autoscaling experts in the room and I generally was curious to
see what solutions they agreed on. I was rewarded with some deep discussions around the mechanics of how workload aware scheduling will
need to work from the hardware pespective. This ended up being very fruitful for me as I walked away with some clear ideas about how
SIG Cloud Provider might support activities where scheduling plugins will need to make calls to the underlying infrastructure provider
to learn about the hardware configurations and topologies.

For anyone interested in this exciting new area of development, I would start by reviewing the DRA related mechanisms that exist in
Kubernetes today. These primitives are inspiring how the future of workload aware scheduling will be architected. Then I would study
the [workload aware related KEPs that are currently under review][gh-was].

Lastly, I am grateful for the opportunity to participate in this design summit. Although I don't think I had much to contribute, I
certainly learned a great deal and will hopefully be able to support the effort through SIG Cloud Provider. I've heard that quote
about "if you are the smartest person in the room, find a new room", and I felt humbled by the assembled brain power at the summit.
Some of the brightest and sharpest minds in the Kubernetes community were there and it was inspiring to watch the thoughtful discussions
that arose.

## KubeCon Day 1, Tuesday March 24

After two solid days of work already, KubeCon proper starts. I briefly cruised the keynotes and the early talks, but my mind was focused
on the two big activities I had for day 1: the [Kubernetes Contribution 101][kc-101] session, and the panel
[From Static Tokens to Attestation: The Evolution of Secure Node Joining][kc-panel1]. I was a participant in both activities and I was quite
excited for the opportunities.

<img src="/img/kubecon-eu-2026-communityhub.jpg" class="img-responsive center-block" alt="Community hub placard">

The Community Hub is one of my favorite parts of KubeCon and when the call went out for SIG chairs and tech leads to participate in the
Contribution 101 session I jumped at the chance. It was a nearly two hour session where we had a presentation about the mechanics of
contribution and the landscape of the CNCF projects, and then a question and answer portion where the SIG leads got to interact with
the audience. It was truly inspiring to see so many people interested in contributing and asking thoughtful questions about how to get
involved. Whenever I have time, I will always participate in these sessions as I love helping new folks get a boost into open source. Passing
on the open source values and ethics is a large part of what I do these days and I want to ensure that we have a healthy community for
future generations.

After the 101 session I had to find the panel where I was a particpant, unfortunately the room was on the opposite end of the convention
center and I had to make haste. Thankfully, I made it with time to spare. The panel went great and we had about 150 people in the room to
hear us talk about a possible future for secure booting and attestation in Kubernetes. In some respects this is new territory for the
Kubernetes community to tackle, although there are bespoke implementations of this style of booting, we would like to develop best practices
that the community as a whole can rely on. This will be important if we want to include secure boot activities in projects like kOps and
Cluster API. While there is more work to be done, we had an excellent conversation and got many good ideas from interacting with the audience.
I'm hopeful that some of the work I'm doing with the Cluster API community to improve ignition support will also help with the workflows
around attestation.

I spent the remainder of my time on day 1 cruising the solutions showcase to see what people were talking about with respect to the product
side of Kubernetes. The solutions showcase was a good time and there was plenty of room and natural light penetrating the room, making it feel
much better to walk around and get lost amongst the technology. As always, LEGO raffles were huge. I also noted the return of the curling
arena.

<img src="/img/kubecon-eu-2026-curling.jpg" class="img-responsive center-block" alt="Curling Skills Arean signage">

## KubeCon Day 2, Wednesday March 25

In many ways, day 2 was a repeat of day 1 for me. I had plans to participate in the [Kubernetes Meet + Greet][kc-mg] and then join the
[How Will Customized Kubernetes Distributions Work for You? A Discussion on Options and Use Cases][kc-panel2] panel. It should go
without saying that I love the meet and greet. It's been a high point for me for several KubeCons now and I volunteered to work the
first hour as a greeter, and then would join the second hour in my SIG Cloud Provider capacity to talk with attendees.

The meet and greet went great, I was able to meet many new folks and help them to find the communities where they could learn and connect
with others. After my official duties had ended, I got a good slice of time to talk with people about SIG Cloud Provider and how they could
get involved. One inspiring discussion that came out of this was with a gentleman who had done documentation work across three languages!
He was connected with developer communities in Vietnam and was curious how he could connect those communities with the wider Kubernetes
community. It was great to talk about how Vietnamese cloud providers will be able to join our efforts and really how they can gain
the benefits of the common cloud provider framework we have developed. It made me feel good to know that the work we are doing in the
open source can truly reach all communities so that they can join the great activity that is happening around Kubernetes.

I had to run at the end of the meet and greet to make the second panel I was doing for this KubeCon. I made it back to the panel room with a
little time to spare, but as it turned out the panel before ours (which was on Node Lifecycle APIs) was packed to the rafters and we had to wait
outside for the room to empty.

<img src="/img/kubecon-eu-2026-cloudprovider-panel.jpg" class="img-responsive center-block" alt="Cloud Provider panel">

The panel went off well and we had about 150 people show up to hear us talk about the idea of Kubernetes distributions. I wasn't sure
what to expect when we proposed this panel. SIG Cloud Provider has been interested in this notion to help us achieve some testing goals, but
also to work towards the future where there is a clear method for cloud provider specific bits to be included with a Kubernetes installation.
Whether that installation happens from kOps, Cluster API, or some other tooling, we would like there to be a common set of guides to follow.
I was touched by how many people approached me afterwards to thank the SIG for diving in to this topic. We'll see how things progress.

In a similar fashion as day 1, I spent some time at the end of the day in the solutions showcase checking out the project pavilion and connecting
with friends at different companies who were working booth duty.

## KubeCon Day 3, Thursday March 26

<img src="/img/kubecon-eu-2026-bootc.jpg" class="img-responsive center-block" alt="Bootc demo">

By Thursday my tanks were running on near empty, but I wanted to get around to the project pavilion again to check out the projects I was less
familiar with, and I was rewarded richly. I spent time talking with my colleague Thilo at the Flatcar Linux booth. We are attempting to improve
the state of ignition in Cluster API and I'm hopeful that we've made some solid designs for work that we can do this year. I also spent time talking
with the Bootc project team as well. [Bootc][bootc] is a really cool project that unlocks a great deal of potential for managing and upgrading
ostree style operating system images. I'm sure it can do so much more than that, but the demo that my colleagues from Red Hat gave showed how
you could perform rolling upgrades and downgrades to an application embedded as part of an ostree image. I am absolutely planning to setup a
home lab for playing around with bootc, especially since I think it will help with the ignition/Cluster API work I'd like to do.

### A note on AI

<img src="/img/kubecon-eu-2026-ai.jpg" class="img-responsive center-block" alt="ai doggo">

I would be neglectful if I didn't mention the presence of AI at KubeCon. There were plenty of talks and demonstrations with people showing off
how they are using AI to build value and also integrate AI into their products. Additionally there was no shortage of talks about how AI
is affecting, and will continue to influence, the software development process. I found the discussion good and the amount of AI related talks
only a little oppressive. One thing I noted that is increasing from the hallway track perspective is that many people are getting tired of
seeing AI related talks and want to see more technical Kubernetes information. I saw several non-AI sessions that were packed to capacity,
and my informal discussions with people seemed to indicate a weariness of AI and also a desire to find spaces where AI was not being
discussed. Hopefully this is a sign that the community is large enough that we need more equal represenatation of ideas at KubeCon. AI has
made its mark and will continue to evolve, but it is not the Ur-solution for all problems.

## Thoughts and takeaways

KubeCon Amsterdam was a tremendous success for me. I had an excellent time connecting with friends and peers from across the industry
and got to participate in some amazing discussions. I am optimistic about the future of Kubernetes and I look forward to how the
community will continue to grow and evolve.

I am hesitant about the continued usage of AI in our software development processes. I can see the benefits but I also see the harm that
it can do to the people involved in the process. I think the most important thing for us to remember is that the people who make up this
community are the most important element, and we should ensure that regardless of the technological changes happening we continue to 
respect and protect the community members.

In brief, here are some thoughts I had:

* Scheduling continues to be a giant topic and it is only becoming more complex.
* AI continues to grow and we are now dealing with how to incorporate this style of development into our open source processes.
* Digital sovereignty and on-premises computing are growing in popularity once again, Kubernetes represents a game changer for people wanting open source solutions that they can own.
* Even with the global economy in an uncertain state, there continues to be investment in cloud services and platform engineering.
* Focus on community health and safety has never been higher, and I fully endorse this activity.

Whelp, that's about it for my thoughts on this retrospective. I hope I can continue to attend KubeCons and be part of this community.
It brings me great joy and satisfaction to know that what we are building, in the open, can help make the world a better place. It seems
challenging to remember this given the state of the world these days, but I count myself as an eternal optimist in this respect. If you
made it this far, thank you, be safe out there, and as always happy hacking!

<img src="/img/kubecon-eu-2026-outro.jpg" class="img-responsive center-block" alt="rainy RAI">

[ms-steering]: https://maintainersummiteu2026.sched.com/event/2EWeU/ask-the-experts-kubernetes-steering-committee-kat-cosgrove-minimus-maciej-szulik-defense-unicorns-antonio-ojea-google
[ms-capi]: https://maintainersummiteu2026.sched.com/event/2EWev/project-meeting-cluster-api
[ms-unconf1]: https://maintainersummiteu2026.sched.com/event/2JTp2/unconference-session-how-should-maintainers-navigate-and-review-ai-based-prs
[ms-cas]: https://maintainersummiteu2026.sched.com/event/2EWf1/cluster-autoscaler-evolution-kuba-tuznik-google-jack-francis-microsoft
[ms-nl]: https://maintainersummiteu2026.sched.com/event/2EWhP/unconference-session-node-lifecycle-state-needs-a-real-api
[ms-photo]: https://www.flickr.com/photos/143247548@N03/55163324677/in/album-72177720332630036
[gh-was]: https://github.com/kubernetes/enhancements/issues?q=label%3Aarea%2Fworkload-aware
[kc-panel1]: https://kccnceu2026.sched.com/event/2EoKz/from-static-tokens-to-attestation-the-evolution-of-secure-node-joining-ciprian-hacman-jack-francis-microsoft-michael-mccune-josephine-pfeiffer-red-hat-justin-santa-barbara-google
[kc-101]: https://kccnceu2026.sched.com/event/2ITlD/kubernetes-contribution-101
[kc-mg]: https://kccnceu2026.sched.com/event/2H66n/kubernetes-meet-+-greet
[kc-panel2]: https://kccnceu2026.sched.com/event/2EF68/how-will-customized-kubernetes-distributions-work-for-you-a-discussion-on-options-and-use-cases-michael-mccune-joel-speed-red-hat-bridget-kromhout-microsoft-jesse-butler-aws-bowei-du-google
[bootc]: https://bootc.dev/bootc/
