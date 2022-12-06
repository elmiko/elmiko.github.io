---
layout: post
title: "KubeCon North America 2022, Detroit Edition"
subtitle:  ""
date: 2022-11-01
categories:
---

I'm super excited to write this after-con blog, not just because it was
another face-to-face KubeCon but also because it was in Detroit, my home town.
So without further delay, let's dive in!

<img src="/img/kubecon-na-me.png" class="img-responsive center-block" alt="me standing in front of a kubecon banner">

Building for the Road Ahead! or perhaps Building Road for the Ahead!, that split
in the signage is slightly humorous to me. Regardless, here I am in the conference
center that I know as [Cobo Hall](https://en.wikipedia.org/wiki/Huntington_Place)
but which the _powers that be_ have decided to currently name Huntington Place.
For me, the venue was awesome. Easy to get around, nothing too far away (I'm
sure the folks who had to get from a 411ABC to 260C might disagree XD), and
plenty of local restaurants, bars, and coffee shops. I was able to drive down
every morning in about 20-30 minutes and the parking was pretty good (if not
a little expensive).

When this conference was first organizing to be in Detroit I wasn't sure how I
was going to make it there, but I knew I had to be there. Luckily for me, in
the end I was able to get a speaker's pass which made the logistics much
easier. A friend and colleague of mine, [Erik Erlandson](https://erikerlandson.github.io/)
was also planning to attend, but by the time he was searching for hotels they
were almost completely gone and it looked like he would only be able to make
the one day where he was speaking. Fortunately for me, Erik was amenable to
the idea of staying at a hotel in the suburb where I live and then car-pooling
with me downtown everyday. Shoutout to Erik, it was one of the best conference
experiences I've ever had. We sampled many a local delicacy as I shared with him
my perspective on the city as a life-long Detroiter, and before any of you ask,
yes I took him to American and Lafayette but I will not disclose his preference!
I on the other hand reaffirmed my allegiance to Lafayette (if you stop reading
at this point I completely understand).

Here's a cool picture that the CNCF photographers snapped of me and Erik (thanks
to [Huamin Chen](https://twitter.com/root_fs) for sharing!).

<img src="/img/kubecon-na-erik-and-me.jpg" class="img-responsive center-block" alt="Erik and I at badge registration">

## Cloud Native Rejekts

Normally I am not in the venue city with enough time before hand to plan for
attending an event like this, but with the travel being negligable and a
friend with an extra pass (thanks Jen!) I was able to attend this one. Rejekts
is a conference of talks that might have been rejected from KubeCon. It's a
single day event with 30 minute talks.

The venue for this event is a place called [Hunt Street Station](https://www.huntstreetstation.com/).
I had never been there before but like many new places downtown it appeared to
have been converted from a much older building. It is now a cool coworking space
near the heart of the city. It had a nice vibe and I was already running into
friends from the wider community as I walked around the venue.

I caught a couple talks at Rejekts before lunch and the prospect of having a
beer with colleagues drew me towards [Eastern Market](https://www.easternmarket.org/)
(which was conveniently within walking distance). I did see a few talks though,
and I think these will be available on the
[Cloud Native Rejekts YouTube page](https://www.youtube.com/c/CloudNativeRejekts)

**[Fun with FreeBSD: Make Your Own Mini-Cloud](https://cfp.cloud-native.rejekts.io/cloud-native-rejekts-na-detroit-2022/talk/8GP8QM/)**<br/>
by Karen Bruner

I love seeing content about *nixes, and seeing something about
FreeBSD tickled me to no end. This talk was an exploration of how FreeBSD
virtualization could be helpful in building Kubernetes clusters. Sadly, I don't
have a FreeBSD machine running currently, but this talk has inspired me to see
if I can repeat what Karen demonstrated.

**[API Server Inception: How many layers down can a virtual cluster go?](https://cfp.cloud-native.rejekts.io/cloud-native-rejekts-na-detroit-2022/talk/G7CXVB/)**<br/>
by Mike Tougeron

Mike is someone who I met through the Cluster API community and I was curious
to see what he was talking about. I had originally thought that this might be
about using Cluster API to create clusters, but in fact Mike is only using
[vcluster](https://www.vcluster.com/) to create these nested instances. He also
created some nice wrappers that allowed the audience to create nested clusters,
with the goal of seeing how deep we could go. I think the audience record was
4 or 5, but Mike had a system running with 19 deep clusters!

## Kubernetes Contributor Summit

Monday brought the [Kubernetes Contributor Summit](https://www.kubernetes.dev/events/2022/kcsna/),
an event I was very excited to join. The Kubernetes community has been doing
more and more with the contributor summits and I think that is awesome. It was
a day of reconnecting with old friends, meeting colleagues face-to-face for
the first time, and talking about technology. What more could a computer nerd want!

The summit has four "tracks", with one being an unconference, and they all have
deep technical and social content. One that I was most eager for was the
[Cluster API Status Update and Roadmap Planning](https://kcsna2022.sched.com/event/1CXNP)
session. We had about 20-30 people gather to talk about Cluster API and our plans
for the future. The two big topics that we ultimately spent the most time on
were; having better support for managed Kubernetes, and refining the workflow
of cluster addons.

Managed Kubernetes is becoming a bigger and bigger topic in the community, with
many vendors providing great "out of the box" solutions for people who want
to ramp up quickly. It would be awesome if Cluster API had some ability to
"adopt" these clusters and give users the ability to monitor, and perhaps manage,
their clusters through Cluster API. But, this process becomes complicated as
we start to try and apply the Cluster API concepts of "Machine", and the related
parents "MachineSet" and "MachineDeployment", to the notion of platforms that
might only expose access to the cluster at a "Node" level. I find these types
of discussions fun as we tilt at the core definitions of the project.

Cluster addons are a feature/concept of Cluster API that allow users to install
extra pieces of software into their clusters automatically. Currently this can
be done through [Runtime hooks for Add-on Management](https://github.com/kubernetes-sigs/cluster-api/blob/main/docs/proposals/20220414-runtime-hooks.md)
which allows for a wide range of options that a user could choose for management.
Something that the community would love is a "package management" style system
akin to [Helm](https://helm.sh/) that could be used for this management. Much like
the previous topic though, this is complicated for many reasons around customization
and cluster topologies. Additionaly, the community does not want to recreate
something that already exists. There is definitely a desire for this, we'll see
how the community decides to move forward.

Something that I found personally exciting was the announcement of a new mascot
for the Cluster API community, Cappy the turtle! (I borrowed this image from the CNCF's website)

<img src="/img/kubernetes-friends.png" class="img-responsive center-block" alt="all the kubernetes mascots">

## OpenShift Commons

On Tuesday, I had the distinct honor of being invited by [Diane Mueller](https://twitter.com/pythondj)
to join OKD community co-chair [Jaime Magiera](https://github.com/JaimeMagiera)
to talk about [OKD](https://www.okd.io/), the community distribution of OpenShift,
at the [OpenShift Commons](https://commons.openshift.org/).  The commons is a
really cool event where we talk about all things OpenShift, and Diane is an
amazing community architect who has been shepherding the community since its
inception, and she is a tremendous colleague as well.

I participated in two events at commons; a meetup with the OKD community, and
a lightning talk about the community status and roadmap. The meetup was a nice
opportunity to talk with people who are using OKD or are curious about it, and
we had a great conversation that filled nearly the entire 2 hours. Even though
we only had about a half-dozen participants at a time, we had some great questions
about the differences between OpenShift and OKD, what types of topologies work
well with OKD, and the state of Windows containers on OKD. Thanks to Jaime and
the wonderful folks who showed up to talk with us.

The lightning talk was also great, a hot, fast, ride through the last 3-4 months
of OKD community, and some of the things we are excited about. The biggest news for
us is the creation of the [OKD Streams](https://cloud.redhat.com/blog/okd-streams-building-the-next-generation-of-okd-together)
and the corresponding Tekton build pipeline
that the community will operate. This empowers the community to truly own the
creation and experimentation that happens around a project of this size, I am
overjoyed to see this happening. As pointed out by [Karsten Wade](https://www.redhat.com/en/authors/karsten-wade),
there was pivotal moment in Fedora's growth where the build and testing
infrastructure was moved from inside Red Hat to the community, and I'm hopeful
that we are witnessing something similar here.

## KubeCon

Wednesday, at last, and the first day of KubeCon! All in all it was a fairly
standard opening, full of keynotes, coffee, and seeing so many friends. I've
already talked about the venue a little bit, so I'm going to focus on the talks
I saw, some talks I wanted to see (and will watch later), and the general _vibe_
I got.

### Talks I saw

I actually managed to catch a few talks in-between my overflowing _hallway track_
schedule. Here are my highlights.

**[API Evolution with CRDs: Best Practices For Authoring & Fuzz Testing APIs](https://kccncna2022.sched.com/event/182HR?iframe=no)**<br/>
by James Munnelly and Andrea Tosatto

Although I'm quite familiar with CRDs and many of the processes around creating
them, I am always on the lookout for ways to improve my skills or new tools
that I might have missed. This talk was a great _foundation_ for anyone who
is creating operators or controllers in Kubernetes today. James and Andrea cover
all the bases of what you need to get started, and then to test and maintain
your work more easily. I enjoyed this talk and it helped me to see some
aspects of testing that are still tricky (looking at you slow cache updates!).

**[Resize Your Pods In-Place With Deterministic eBPF Triggers](https://kccncna2022.sched.com/event/182HU?iframe=no)**<br/>
by Pablo Chico de Guzman and Vinay Kulkarni

I went into this talk prepared to have my mind slightly blown. I had some ideas
about the techniques that might be shown and I was happy to be nearly completely
wrong! Pablo and Vinay showed us how they are using eBPF to run a process on Kubernetes
hosts that can inspect commands running in a given namespace (for example in a
container), and then do an in-place resize on the pod. So, for example, when the
application sees someone run `make` in a container, the eBPF application increases
the pods memory and cpu appropriately. The demo they showed to support this was
quite impressive, and my mind was slightly blown. kudos Pablo and Vinay. It is
worth noting, that before this can work for everyone we will need to merge
[KEP-1287 In-Place Update of Pod Resource](https://github.com/kubernetes/enhancements/issues/1287).

**[KEDA - Real Time And Serverless Scaling in Kubernetes](https://kccncna2022.sched.com/event/182Ml?iframe=no)**<br/>
by Jeff Hollan and Zbynek Roubalik

I have been watching KEDA for some time now, mostly inspired by my work in the
SIG Autoscaling community and a desire to understood more about autoscalers and
what is available to Kubernetes users. It doesn't hurt that Zbynek is a friend
and colleague who i admire greatly ;)

This talk was fun and helped me to understand KEDA much better than I had in
the past. I had always had a dream that perhaps KEDA could be used in weird way
to control cluster autoscaling by addressing the scale resources of MachineSet
and MachineDeployment resources. I'm not entirely convinced that it can't be done,
but I think I've convinced myself that it probably **shouldn't** be done.
Regardless, if you are looking for a way to used an event stream as a way to
signal scaling operations on a pod level, I highly recommend reviewing this talk.

**[Beyond Kubebuilder - Generating Entire Kubernetes Controller Implementations](https://kccncna2022.sched.com/event/182Hd?iframe=no)**<br/>
by Amine Hilaly and Jay Pipes

Another topic that is near and dear to my heart, automated code generation. This
is something I studied heavily while working on the OpenStack API Working Group.
Especially as it pertains to using OpenAPI to generate code for API services.
The OpenStack communnity was also where I met Jay Pipes, and I am always curious
to hear what he has to say.

I found this talk to be high-quality for a couple reasons; Amine and Jay shared some
real world experience from inside AWS, and they also brought reciepts in the form
of metrics and samples from their work. In the end, I think they made a very
convincing argument for how autogenerated code helped AWS to formulate a plan
for migrating code for 200 service (they are not done yet) to a more common
base. This in turn is helping them to reduce bugs and duplicated efforts.

**[Cgroupv2 Is Coming Soon To a Cluster Near You](https://kccncna2022.sched.com/event/182JZ?iframe=no)**<br/>
by David Porter and Mrunal Patel

I only got to see the last half of this talk as I had just been representing a
few SIGs at the meet and greet, but what I saw was very interesting to me. I love
to learn about operating systems, and the more I learn about Linux the more I
want to know. Even though I've been working in and around the Linux ecosystem
for more than two decades there is always cool stuff coming out. I will definitely
go back and watch the recording on this one.

### Talks I wanted to see (and will most likely watch the recordings of)

I'll start off with the talks I heard about from others, or that I really wanted
to see because I know the topic or speakers.

**[The Course Of True Community Management Never Did Run Smooth, In 1 Act](https://sched.co/182E3)**<br/>
by Karsten Wade and Jen Madriaga

I have such huge admiration and respect for both Karsten and Jen, and I am
intensely curious about building community skills. Probably don't need to say
much more, but this is my first watch once the videos are up ;)

**[Kcp: Towards 1,000,000 Clusters, Name^WWorkspaced CRDs](https://sched.co/182I7)**<br/>
**[Towards Something Better Than CRDs In a Post-Operator World](https://sched.co/182Hm)**<br/>
by Stefan Schimanski

Stefan is a fellow Red Hatter working on OpenShift and I am always curious about
the work that he and his group are doing. These talks are both giving some windows
into the future of Kubernetes which really excites my interest.

**[No One Is Saving Us But Us](https://sched.co/182EC)**<br/>
by Tabitha Sable and Paris Pittman

This talk was recommended to me by several people, and it was also delivered at
the contributor summit, but somehow I managed to miss it both times. Definitely
going to watch the recording.

The following talks just looked really cool to me.

**[WebHook Fatigue? You're Not Alone: Introducing the CEL Expression Language Features Solving This Problem](https://sched.co/182Q6)**<br/>
by Joe Betz

**[Who Knew Dogfood Could Taste This Good? A WebAssembly In Production Story](https://sched.co/182Gl)**<br/>
by Taylor Thomas and Brooks Townsend

**[Using the EBPF Superpowers To Generate Kubernetes Security Policies](https://sched.co/182GW)**<br/>
by Mauricio Vasquez Bernal and Alban Crequy

**[Kubernetes-Bees: How Bees Solve Problems Of Distributed Systems](https://sched.co/182DK)**<br/>
by Simon Emms and Christian Weichel

### The _vibe_ check

Things were cool. People seemed to be having a great time and really enjoying
being together again. I don't think I heard many complaints about the venue or
the city (which was nice for me), and I heard several people praising the event
staff and the locals for creating such a welcoming environment. kudos all around!

I haven't spent much time at _Huntington Place_ (still doesn't seem right to me)
but I found this statue on the river side of the building.

<img src="/img/kubecon-person-with-canoe.png" class="img-responsive center-block" alt="person carrying canoe">

It depicts a native American [portaging](https://en.wikipedia.org/wiki/Portage)
their canoe by carrying it across their shoulders. The great lakes area of the
United States, much like many other parts of the country, has a rich native
history that extends beyond our current epoch. Seeing this statue stirred some
emotion in me about the concept of _portaging_ our canoes across the dry land
to find other streams where we might paddle. Sometimes the open source community
feels that way too. You might find a problem, run out of water to paddle, so you
must pickup your canoe and carry it across the dry land until you can gain access to
safe water again.

I know it may seems trite to bring up the concept of _carrying our own canoes_,
but bear with me a little longer. The last two, nearly three, years have seen us
all carrying our own canoes whether by the lengths we are willing to go to meet
in-person (masks, tests, etc), or just by the fact that we are making space and
time for our colleagues who are also experiencing something similar. I find it a
tricky balance in open source between the individual freedom/responsibility to
the technology and community, and the need for strong groups that work well
together. The notion of portaging our own canoes, imo, speaks to the notion of
our decentralized distributed community. Yes, we are all responsible to carry
our canoe over the dry land, but we don't do it alone. We travel in groups, and
help each other when the load is too great.

All told this was one of the best conferences I've ever attended, and yeah a lot
of that is because getting something as big as KubeCon to come to Detroit is
really exciting for me, but it's also because I saw a lot of high quality talks,
got to have numerous conversations that will inspire side projects for months
(if not years), learned a lot, and got to spend time with great friends sharing
with them the best parts of a city I love.

Thank you to everyone who attended, I hope to see you in Amsterdam, and as always
happy hacking =)
