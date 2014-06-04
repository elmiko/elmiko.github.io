---
layout: post
title:  "OpenStack Summit Atlanta 2014 Review (part 2)"
date:   2014-06-03
categories: openstack
---

*update 2014-06-04: added links to the talks*

Welcome back! This is the continuation of my review of the Atlanta 2014
OpenStack Summit. If you missed it, part 1 is available
[here](http://elmiko.github.io/openstack/2014/05/21/summit-atlanta-2014-review-part1.html).


Consistency across Openstack ReST APIs
----
*Design session*

This was a nice design session about how the OpenStack developer community
can work towards creating ReSTful APIs that are more consistent across
projects.

One of the main themes discussed is the need to create some sort of style
guide that could be used as a model for projects. There was also considerable
talk of the need for consistency without creating a policing organization, 
more of a "soft" enforcement.

Another big topic was the need for nomenclature to become more consistent. A
few examples were "tenant" vs. "project", and "instance" vs. "server".

I came away with a new way of thinking about how to examine the ReST APIs
that are employed across OpenStack. One of the main things I did after the
session was spend some time studying the Nova API, as it was brought up that
Nova laid much of the groundwork for future APIs.

[Etherpad from the session](https://etherpad.openstack.org/p/juno-cross-project-consistency-across-rest-apis)

How to Improve Security in your OpenStack project
----
*Design session with the OpenStack Security Group*

Another interesting design session, that raised my awareness of the OpenStack
Security Group. The group are very interested in helping all OpenStack projects
improve their security models. To that end they expressed their eagerness to
be referenced by any project that could use guidance. It sounded like they
were more than happy and willing to enagage with any team that reached out.

A big takeaway from this talk was the idea of marking reviews in Geritt with
the "security" tag. This will throw a warning up to the OSSG that you would
like them to help assess the security implications of a patch. They also made 
note of design work that the OSSG could help with, and that involving them 
during the blueprint phase is the most useful.

[Etherpad from the session](https://etherpad.openstack.org/p/juno-security-discussion)

Open vSwitch and the Intelligent Edge
----
*Justin Pettit*

This was another mind-blowing talk for me, about using Neutron and the
"intelligent edge" to open new possibilities for network monitoring. In this
context Justin was referring to the hypervisor host as the edge for the
virtual network.

The people at VMware are creating some interesting patches to the
infrastructure of Neutron network agents to create new styles of packet
tagging. These tagging mechanisms give a great amount of control and
introspection over traffic that enters and exits virtual machine instances in
an OpenStack deployment.

One of the use cases discussed was the detection and routing of "elephant" and
"mouse" traffic inside a virtually defined software network. Their results
showed significant performance increases for the mice with minimal loss for
the elephants by becoming more aware of the traffic types and then changing
the network flow at the host L3 layer. They presented some truly dazzling
combinations of virtual interfaces inside a host that created virtual
routes between the physical network and the virtualized instances.

This case was just the tip of the iceberg as Justin went on to show a whole
host of tools that could be used to gain per-user and per-process information
from inside a virtual instance. This information could then be used by
external network controllers to help shape traffic or improve security.

The main approach to achieving these capabilities involved installing daemon
processes, and Neutron L3 agent patches, in the virtual instances which could
tag packets and send additional information to the host machine. The host
machine in turn could create a virtualized network between it's physical
interface and the virtual interfaces with the effect of creating a new
virtual network device primed for interrogation.

Some of these concepts may not be new in the software defined networking
community, but the way Justin and the crew at VMware are putting them to use
definitely opened my eyes.

[Justin's blog post about Elephant Flow Mitigation](http://blogs.vmware.com/networkvirtualization/2014/02/elephant-flow-mitigation.html)

[Watch the talk here](https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/open-vswitch-and-the-intelligent-edge)

Linux Containers - NextGen Virtualization for Cloud
----
*Boden Russell*

As Docker continues to burn up the charts, containerization becomes an ever
hotter topic and this talk was packed to the rafters. In general the pieces
that make up containers are not new to the \*nix world. In this talk Boden did
a great job of breaking down the individual pieces that are used in the
process.

In short, the main pieces to consider for containers are; cgroups, chroots,
namespaces, and the Linux security modules. Where these technologies really 
take off is when they are combined with good tooling to make the creation and
management of containers simple and efficient. This is where projects like
Docker are making huge waves.

One of the main benefits to containers is that they require no hypervisor
overhead in comparison with traditional virtualization. Boden had some
great slides that showed the performance benefits of using contianers over
virtual instances. The biggest benefit seemed to be in the area of spinup
times for new containers over instances. In addition, containers can achieve
near bare metal performance for their applications.

Another big benefit comes with the way containers are packaged. Because they
are, more or less, filesystems that live within the host operating system
there is no need to create virtual disk images. This relieves much of the
pressure behind creating bootable images for a virtual machine, and removes
many moving pieces when the time comes to debug. In turn, this gives the
packager a greater focus on only the pieces that matter to the container in
question without the need for mounting an entire disk image.

It's not all roses though, there are some issues that the container world are
working to make better. Networking is one where things can get slightly
"weird" depending on the experience of the ops team. Also security appears to
be an evolving area of interest due to the tight coupling between the
container application and host kernel. Because all containers live on the
same kernel, all the heavy lifting is contained within that kernel and this is
where work can be done to help improve the current state of affairs.

Fortunately Boden made his presentation available on slideshare.net, I
highly recommend it for anyone looking to gain a foothold into the
technologies that make containers possible.

[Boden's presentation](http://www.slideshare.net/BodenRussell/linux-containers-next-gen-virtualization-for-cloud-atl-summit-ar4-3-copy)

[Watch the talk here](https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/linux-containers-nextgen-virtualization-for-cloud)

Using ZeroVM and Swift to Build a Compute Enabled Storage Platform
----
*Blake Yeager and Camuel Giyadov*

I wasn't initially planning to see this talk but a colleague was interested
and I joined him, and I'm glad I did!

ZeroVM is an interesting bit of technology that seems to be touting itself as
an alternative to the virtualization vs. containerization discussions that
are happening. ZeroVM creates an isolated computing environment for
arbitrary code execution.

At it's heart ZeroVM incorporates the Google Native Client with a subset of
the POSIX API, a port of CPython, ZeroMQ for messaging, and a full compiler
toolchain. This allows users to create applications that have a virtual
environment that is very similar to a full instance. The benefits of this
style of platform are that the boot performance and overhead are akin to that
of containers and the security is closer to that of virtual machines.

Aside from a general introduction, the talk centered on how to use Swift and
ZeroVM to create data manipulations that occur as requests for data are made.
One example was image watermarking during HTTP GET requests. The ZeroVM
middleware could be placed between Swift and the web-facing front end such
that when users made calls the data could be pushed into the ZeroVM
environments, processed, and returned as the result of the user's request.
Because of ZeroVM's very low start time this operation could be done at the
time of request and could scale quite well.

Another use of Swift with ZeroVM is storing pre-validated applications as
Swift objects. This approach starts to create a new environment where the
ZeroVM applications become part of the data and can be called by a proxy
server as necessary when desired by the user. In this respect the speakers
hinted at the idea of merging compute and storage operations into a single
hierarchy.

The ZeroVM project is still growing and there are several areas where it can
be improved. In the form demonstrated, the scheduler for complex jobs was very
simplistic mainly relying on randomization to select job priorities, without
much logic for duplicate jobs. In addition the Python packages available
inside ZeroVM are limited as there is much work to be done porting to the
limited environment.

All in all, ZeroVM is an exciting platform and there are several projects
which are paving a bright future for it. My takeaway is that the ZeroVM folks
would like to transform how we think about storing and retrieving data to
include processing during those operations.

[ZeroVM project](http://zerovm.org)

[Watch the talk here](https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/using-zerovm-and-swift-to-build-a-compute-enabled-storage-platform)

Introduction to OpenStack Trove: A Multi-database Deployment with MongoDB and MySQL
----
*Michael Basnight and Doug Shelley*

I went into this talk not knowing much more than Trove is a project that does
something with MySQL. I came out understanding that Trove could be a 
invaluable asset to anyone who needs to manage a database infrastructure.

Quite simply, Trove is a system for managing and controlling databases. It
uses OpenStack as a blackbox deployment platform allowing administrators to
manage, scale, ensure high-availability, incorporate multi-tenancy, and
efficiently distribute resources for their databases. Like other OpenStack
projects it provides a command line interface and a ReST API for manipulating
it's operations.

Having done some database operations work I can only imagine how useful it
would have been to have Trove in the toolbox. It allows an administrator to do 
all the ugly tasks that need to be done(backups, migrations, load distribution,
etc.) in one convenient package. I like the approach that the developers have
taken with Trove, namely to enhance the user experience of working with the
day-to-day administrative tasks of database management.

Currently Trove has support for many database formats(MySQL, MongoDB, Percona,
Couchbase, Cassandra, Redis, and probably a few more I missed), as well as a
strucutre for creating new datastore models. It is similar to other OpenStack
projects in that it requires an agent running on it's nodes to communicate
and control operations. Virtual machine images can be pregenerated or
provisioned at runtime, and commanded through the root controller node. In
the end, the developers proposed the question "can Trove be a building block
for every OpenStack service?"

[Watch the talk here](https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/introduction-to-openstack-trove-a-multi-database-deployment-with-mongodb-and-mysql)

Final Thoughts
----

As I mentioned in
[part 1](http://elmiko.github.io/openstack/2014/05/21/summit-atlanta-2014-review-part1.html) I had a thoroughly enjoyable time at the Summit. I look forward to attending
again in the futre and hopefully I'll have a better mind towards organizing
the talks I attend and get more involved in the design sessions.

I didn't mention it specifically, but the "hands on" sessions were very well
done and I enjoyed being able to flex my fingers with some of the masters
present. I was able to get some good ear-bending in with people who are
administrating OpenStack instances and understand the problems that users are
facing.

Finally, as noted before, if I've missed or misrepresented anything please get
in touch with me and let me know. I hope this has been informative and gives
a taste of what an OpenStack Summit is all about. Time to get out there and
code!
