---
layout: post
title: "Chaos Carnival 2021 debriefing"
subtitle:  ""
date: 2021-02-15
categories:
---

Last week I was able to attend the [Chaos Carnival 2021](https://chaoscarnival.io) virtual
conference. It is a conference about chaos engineering and related topics, with a heavy emphasis
on [Kubernetes](https://kubernetes.io) and cloud native computing. Although I am mostly
a novice in regards to my experiences with chaos engineering, I found the conference content
enlightening and inspiring, and I now feel excited about the prospect of learning more
and becoming involved.

Firstly, I would like to thank the organizers, speakers, and participants of the Chaos Carnival.
Thank you. The event went off without error (from my perspective), and I had a wonderful time
enjoying the presentations and discussions that took place over the 2 day conference.

Although Chaos Carnival is not a huge conference, I would like to highlight a few of my favorite
talks. If you have limited time for watching, these are the talks that I found most helpful to
my learning. It's worth noting again that I went into the conference as a relative novice,
I wanted to learn more about the general principles of chaos engineering and see how people
are using these techniques.

## My favorite talks

### [The Psychology of Chaos Engineering by Julie Gunderson](https://www.youtube.com/watch?v=KkNWpIDaaOI)

This was a "why" style presentation where Julie explores the rationale and mindset behind chaos
engineering. I learned a good deal about what types of perspectives to adopt when looking
at implementing my own experiments using a chaos methodology. I also learned about
the social implications of doing chaos style testing, and how to improve the effectiveness of your
efforts at a team and organizational level. Julie breaks down many of the core concepts from a high
level and advises a continual reminder to think about the humans who will be involved along the way.

### [IBM's Principles of Chaos Engineering by Robert Barron](https://www.youtube.com/watch?v=sEwsZZcvufg)

This is another "why" type of presentation, but also dives deeply into the specific methodologies that
IBM have developed. If Julie's talk gave me a good notion of the high level concerns in chaos engineering,
Robert's talk was a great follow on that explores how you can act at each level of the process. IBM
has been doing this type of engineering and testing for decades, and Robert delivers a clear and
thoughtful view into how you can use IBM's experience to improve your team's efficiency and accuracy,
and also how to build increased trust around this style of engineering.

### [Creating a learning culture by Amir Shaked](https://www.youtube.com/watch?v=_6EXY4Lr2IY)

Although this talk hints at some the "why" type topics, Amir diverges from an extended discussion
of the perspectives and rationales to share concrete advice for running debriefing sessions. Similar
to Robert's talk, I found this one full of actions that I could adopt into my current team practices.
Amir shared some of his experiences around performing chaos experiments, but spent a large portion of
the presentation discussing how to most effectively perform and share debriefings. One big
takeaway from this talk for me is critical importance of transparency and openness when practicing
chaos experiments within an engineering organization.

## More excellent talks!

Ok, so you've watched my favorites but you are still hungry for more Chaos Carnival?

Great! Here are several more talks that I attended, and some of my thoughts on each. Also,
the conference organizers have put
[all the talks on their YouTube channel](https://www.youtube.com/channel/UCDoH57pQWHU0MCm6Y5Y3LhA).

### [A powerful framework for network chaos experiments by Andreas Krivas](https://www.youtube.com/watch?v=whdDP41Omd8)

Andreas covers some high level chaos concepts before diving into a discussion of different tooling that
is available to help. He covers what the tools do and why you might want to choose one over another. Ultimately,
Andreas gets into the details of the [Litmus project](https://litmuschaos.io/) and how you incorporate it into your engineering.

### [Chaos testing Red Hat Openshift Virtualization by Jordi Gil](https://www.youtube.com/watch?v=VITGHJ47gx8)

I have to admit that I was attracted to this talk because I work for Red Hat and on OpenShift.
That said, Jordi gives a great window into a real user story about how his team used the Litmus project to
run experiments on the OpenShift virtualization(kubevirt) stack. I'm excited to reach out to him outside
of the conference to learn more.

### [Chaos Engineering the Chaos Engineers by Jason Yee](https://www.youtube.com/watch?v=tgVXdaXFHp8)

In this presentation Jason shares some of his experiences around organizing chaos engineering efforts,
what makes him passionate about this field, and how to deal with some of the external factors around
this style of experimentation. This talk has some really nice content, but I have to say that I was
not a fan of the delivery style that Jason chose.

### [Getting Started with Observability for Chaos Engineering by Shelby Spees](https://www.youtube.com/watch?v=8trr8gwxucw)

This presentation was a focused look at observability and telemetry in chaos experiments. Shelby breaks
down what observability means, how to achieve better results, and things that might be distracting factors
when looking at telemetry data. She also does a great job of hammering home some of the core concepts
around blast radius, error budgets, and choosing good data.

### [Chaos Engineering is fun! by Eugenio Marzo](https://www.youtube.com/watch?v=10tHPl67A9I)

Eugenio definitely wins the prize for most "fun" topic at Chaos Carnival. In this presentation he discusses
a tool he has been working on called [Kubeinvaders](https://github.com/lucky-sideburn/KubeInvaders). Kubeinvaders
is essentially a gamified front end to illustrate a unique approach to chaos engineering. If you want to see
an intersection between gaming, chaos engineering, and Kubernetes, this is your talk!

### [Chaos Engineering for Cloud Native Security by Kennedy A Torkura](https://www.youtube.com/watch?v=pAmLXqQppDo)

I really appreciated that Kennedy stayed up late to give this talk(iirc it was midnight his time when it finished).
This talk is a nice deep dive into the world of security chaos engineering. Kennedy does a thorough job
of explaining the key differences in doing security work in this manner, and then shares several activities
to focus on when doing security specific chaos engineering.

## Closing thoughts

I really enjoyed the Chaos Carnival. I doubt I would have been able to attend if this were a face-to-face
only conference, and I am very thankful for the opportunity I had.

I'm also oddly inspired by listening to these 2 days of talks. I want to get more involved with running
"experiments" on my platforms (mainly OpenShift/Kubernetes). I found the messages of
improved reliability testing along with building cultures of experimentation and testing to be
refreshing. I have a feeling many of my colleagues are already doing this type of work, but I find
myself keenly interested in the social, as well as engineering, practices that can make "chaos engineering"
a success.

Something that I took away from the presentations I watched and the discussions I had is that
"chaos engineering" is about so much more than the technology. There is a huge social component
involved with getting the most out of these efforts. I suppose this shouldn't be too surprising
as software engineering has always been a discussion between developers and users and stakeholders,
but the principles of chaos engineering drive this message home.

I've always loved the side of software development that is about collaboration and teamwork, I
suppose that's a big reason why I work in the F/OSS community. Hearing all these stories about
how increased openness and transparency led to amazing collaboration with chaos engineering
felt good. Hopefully I will find compatriots who are sharing this journey, it will certainly make the work
easier for all of us! XD

stay safe out there, and happy hacking =)
