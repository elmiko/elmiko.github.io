---
layout: post
title:  "OpenStack Tokyo Summit"
date:   2015-12-02
categories:
---

I had the opportunity to once again attend the OpenStack Summit conference,
and as usual it was an excellent and productive experience. I participated
in the main conference and the design summit focusing mostly on the
Sahara project with a few sessions on security, Barbican, and the API
working group. Sadly, like the last summit, I did not manage to make many
of the non-design sessions, but thankfully the summit organizers are
efficient and timely about putting the videos up on youtube.

Before I get into my breakdown of the action, I'd like to extend many
thanks to all those who planned, participated, and helped to make this a
tremendous event. You really make these summits a joy to attend and I get a
wealth of experience and comarderie out of them. Thank you!

<a href="http://imgur.com/2Wfx1Vx">
<img src="http://i.imgur.com/2Wfx1Vxl.jpg" title="Marketplace entrance" />
</a>

First things first, the flight was long, but very worth it. Having never
been to Japan i was really blown away by the country and I hope to return
someday.

The conference was excellent as mentioned before, the big takeaways for
me were the increased interest in networking, containers, and operations
at scale. There were several good keynote speeches with cool demonstrations
of technology. Of course containers continue to be a large attraction and
the integration with OpenStack is getting better and better, with some
nice announcements about improved networking and orchestration support. And
speaking of networking, the buzz around network function virtualization(NFV)
is strong and growing. Some stats were given about the growth of projects
and no surprise neutron was at the top of the pack.

Another interesting topic that I only had exposure to during the keynotes
was the software defined data center. This was a topic brought up by
Kang-Won Lee from SK Telecom during his address[1]. Although it was only
a brief part of the talk, I find the idea intriguing and am fascinated
by the networking technology being used to create it.

As I mentioned, I did not take the opportunity to see many talks live but
I did watch a few after the show and in the week after. Two of the talks
I really enjoyed were Ethan Gafford's "Data Processing is Made of People"[2]
and Miguel Grinberg's "Life Without Devstack"[3]. I must mention that Ethan
is a co-worker and we both work on the sahara project.

Ethan's talk is a great journey down the path of implementing software
features that meet the user's expectations and the developer's interests in
a manner that is productive and satisfying for both parties.

I'm really working on trying out what Miguel suggests as an alternative to
devstack, namely installing several containers and using Ansible to deploy
the OpenStack services into them. I think this would really help my
development life and give me a little more control over the services in my
stack. Sadly, I've been blocked several times by my lack of experience with
Linux Containers(LXC) on Fedora.

In the latter part of the week I attended many good design sessions with
some great work being produced by all the teams I encountered, and even our
small API working group session provided a good discussion about the future
of the group and possibilities for renewed involvement.

Lastly, I must plug my own foray into the conference talk schedule. Although
I have submitted talks in the past, this year was the first time I've had
success. I participated in two talks about data processing with sahara, one
on Spark[4], and one on Storm[5], both regarding stream processing.

The talk on Storm was with Telles Nobrega and Andrey Brito, and in it
we discussed processing messages from Twitter. While the talk on Spark was
with Chad Roberts and Nikita Konovalov, and we discussed processing live
log data from OpenStack service controllers. I had a blast presenting, and
want to give a big thanks to all my co-presenters. I have known these guys
since I started working on sahara and they are all talented developers and
good people to hang out with, thanks guys!

Another great summit, I hope to attend again and look forward to more
interesting development in the world of OpenStack.

[1]: https://www.openstack.org/summit/tokyo-2015/videos/presentation/skts-journey-toward-platform-company-with-5g-network-and-openstack

[2]: https://www.openstack.org/summit/tokyo-2015/videos/presentation/data-processing-is-made-of-people-a-case-study-in-role-empathic-api-design-in-sahara

[3]: https://www.openstack.org/summit/tokyo-2015/videos/presentation/life-without-devstack-upstream-development-with-osad

[4]: https://www.openstack.org/summit/tokyo-2015/videos/presentation/this-is-sparkhara-openstack-log-processing-in-real-time-using-spark-on-sahara

[5]: https://www.openstack.org/summit/tokyo-2015/videos/presentation/sahara-storm-real-time-data-analytics-in-openstack
