---
layout: post
title:  "OpenStack Summit Atlanta 2014 Review (part 1)"
date:   2014-05-21
categories: openstack
---

The Atlanta 2014 summit was my first time attending an OpenStack gathering and
I absolutely loved it. The amount of learning and communication that occurred
was fantastic. Although I was exhausted at the end of every day, it usually
took me quite a while to fall asleep as my mind was turning over all the
interesting things I had learned.

The summit was more than just a great opportunity to learn though, I also had
the pleasure of meeting several team members as well as a host of wonderful
people I had communicated with only through irc and email. The design sessions
were a great time to confer with fellow developers and users, and I felt a
spirit of cooperation that permeating the event.

Aside from participating in the Sahara related events I was also keenly
interested in learning more about Neutron and OpenStack networking in general.
By Tuesday evening I felt that I had been drinking from the Neutron firehose
as there were several excellent talks. It wasn't all networking though, I did
spend some time in the talks about Docker and ZeroVM, as well as learning a
little about Trove.

Before I get stared with my reviews from my favorite sessions I want to extend
a giant thank you to all the people that helped make the Summit awesome. I
felt everything was well organized and I was able to find what I needed fairly
easily. In addition the staff were welcoming and able to help me with the
limited questions I had. So to all you Summit helpers, planners, and staff,
thank you.

These are not all the talks I attended, but these were a few that made a big
impression on me.

An Overview of Open Source Backends for Neutron
----
*Mark McClain and Kyle Mestery*

This one really got me going in terms of just how flexible Neutron and the
larger networking environment can be. It was interesting to learn about the
options for reconfiguring the L2 and L3 agents. 

In general, like much of OpenStack, a REST API is used to communicate with
the Neutron server. The server then uses AMQP messaging to talk with all L2
and L3 agents.

Out of the box, Neutron provides the ML2 modular plugin that can communicate
with OpenvSwitch for L2 services. It also provides L3 and DHCP agents, there
are also service plugins for load balancing, vpn, and a few others.

Some of the limits identified in the talk with the builtin plugins are the
scalability of the L2 agents, and the necessity of having proper open source
drivers for any L3 agent that are to be used. In addition the developers
working on these projects come from a broad background and are not all
network experts.

The L2population driver is a project that provides overlays via iptables rules
for both the OpenvSwitch and LinuxBridge L2 agents.  It helps with direct
routing between agents and can reduce the amount of traffic generated on a
physical network. More information about L2population driver can be found at
[https://wiki.openstack.org/wiki/L2population](https://wiki.openstack.org/wiki/L2population).

OpenContrail provides a full solution for virtualized networking. It offers
cloud networking through a combination of controller nodes and vrouters. It
is not included by default but there have been some efforts to use it with
devstack. The OpenContrail nodes can be controlled with Compute and they
configure a new virtual layer for networking. More information can be found at
their main site [http://opencontrail.org/](http://opencontrail.org/), in
addition there is at least one effort to bring OpenContrail to devstack at
[https://github.com/dsetia/devstack](https://github.com/dsetia/devstack).

Another option for providing networking services is OpenDaylight, which aims
at infrastructure as a service as a primary use case(but not the only one). It
is part of the ML2 MechanismDriver in Icehouse, although it currently requires
DHCP and L3 agents. The Compute node provisions an OpenDaylight node and
network nodes which are then controlled by the Neutron server. More
information about OpenDaylight can be found at their site
[http://www.opendaylight.org/](http://www.opendaylight.org/).

The last backend discussed in this talk was a newer project named Ryu Network
OS. Ryu supports the OpenFlow protocol and can work with the ofagent ML2
MechanismDriver or a standalone plugin driver. It supports multi-tenant
networking, VLANs, GRE tunnels, as well as host port-binding, in the case of
the latter this only works with a Ryu or OpenFlow agent running on the host.
Similar to other options, Compute provisions a Ryu node and network nodes
which are controlled by Neutron. More information about Ryu can be found at
[http://osrg.github.io/ryu/](http://osrg.github.io/ryu/), and extended
information about the ofagent can be found at
[https://github.com/osrg/ryu/wiki/OFAgent-Openstack-IceHouse-environment-HOWTO](https://github.com/osrg/ryu/wiki/OFAgent-Openstack-IceHouse-environment-HOWTO)

High Availability in Neutron: Getting the L3 Agent Right
----
*Sylvain Afchain and Emilien Macchi*

High availability is a huge issue for OpenStack services and in this talk the
guys from eNovance showed us what they are working on for Neutron solutions.
They have put together an L3 agent structure that provides a functional
failover for a break in networking. They even provided a live demonstration of
losing an L3 agent during a ping to an instance and the resumption of ping
after a small interruption.

Currently in OpenStack, losing an L3 agent usually means losing access to a
virtual instance. The eNovance solution involves the addition of a heartbeat
service to keep a monitor on multiple L3 agents. In the event of a failure the
heartbeat service helps manage the infrastructure to keep routing consistent.
This solution is not a perfect high availability and is not instantaneous, but
it is functional. I imagine this is not ready for production yet but it is an
interesting proof of concept.

There were two methodologies talked about for achieving the heartbeat failover
mechanism. The main metholody made use of the Virtual Routing Redundancy
Protocol with a modified Neutron server and L3 agents. The second methodology
uses Dynamic Virtual Routers controlled by the Compute node in combination
with the L3 heartbeat services. It was slightly difficult to understand
exactly how these methods differed and adding to this confusion was the idea
that the DVR method could make use of VRRP.

Some of the main points discussed for the VRRP method of heartbeating involved
no API changes to the services provided by OpenStack, the addition of extra
configuration, working within tenant networks and external networks, and not
breaking FWaaS, VPNaaS, and LBaaS. Some of the changes to the Neutron server
discussed were the addition of an HA L3 scheduler, virtual router ID
attributes, and a special network for VRRP traffic. There were also changes to
the L3 agent deployed on the hosts that involved a new keepalive interface
manager with IPs as virtual IPs, and optional Contrackd support.

The implementation of the VRRP method involved the L3 agents communicating
their statuses via the newly created VRRP network. Keepalived or Contrackd
are used with this setup to provide integration for the virtual IP
traffic. The main limitation of this approach is a hard cap of 256 virtual
routers per HA network which can be worked around by creating more than 1 HA
network per tenant.

The Dynamic Virtual Router methodology was also discussed and involved the
Compute node maintaining the main virtual router. This allowed traffic between
different networks on the same Compute node to occur without needing to hit an
external L3 agent. The added benefit from this approach was that no single L3
agent would bottleneck the traffic. They also mentioned that the DVR method
could be used with VRRP, but I'm not quite sure how these would combine
together.

I was able to dig up a few links related to this talk, one is a [blog post by
Sylvan](http://techs.enovance.com/6413/summit-openstack-neutron-point-of-view)
and the second is a [blueprint](https://blueprints.launchpad.net/neutron/+spec/l3-high-availability)
that was started to implement high availability behavior in Neutron.

Troubleshooting Neutron Virtual Networks
----
*Phil Hopkins*

This talk took a deep look at the tools you might use to help find where the
issues are with a troublesome network. I found it to be a great use as Phil
went through a number of very useful command line utilities for examining and
diagnosing networking traffic within a Neutron and OpenvSwitch environment.

I think most of these tools are known to anyone who has done some digging around
their networks(e.g. ping, traceroute, tcpdump, etc). Some of the tools are
very specific to OpenvSwitch(e.g. ovs-vsctl and the like) and Neutron. There
were two big takeaways from this talk for me. The first was a nice
workflow for diagnosing problems and the second were some new ways of thinking
about troubleshooting in a software defined networking environment.

The workflow Phil described was as follows:

* Define the problem
* Examine the situation
* Consider the causes
* Consider the solutions
* Act and test
* Review troubleshooting

To fully benefit from this flow you must be able to work it forwards and
backwards to gain a greater perspective on the problems experienced. In
addition you must always be cognizant of making changes during the 
troubleshooting process.

The other main point I took away from this talk was the idea of using the
virtual network to help diagnose what is happening. Phil showed some great
workflows for creating new virtual ports and attaching them to the networks
for the purposes of snooping on the traffic to help determine where a break
might be happening. This was a point that gave me a real wake-up moment for
virtual networks. I have always understood the idea of putting extra devices
on a network to sniff traffic but I hadn't yet considered the ways you could
add devices to the virtual network for the same purposes.

All in all a great talk and perhaps material for another post with greater
explanation of the tools and methods Phil described.

End of day 1
----

These talks all took place on Monday! I actually attended a few others this
day, including the Sahara project overview which was really nice. I thought
I would include all the talks I went to in one post but I think this is
getting long enough and I still have several more to go.

So, stay tuned for part 2 where I'll cover more networking stuff and start to
get into the Docker and perhaps ZeroVM talks.

And, if I have missed anything here or misinterpreted something please drop
me an email so that I can get a correction up as soon as possible.

thanks!
