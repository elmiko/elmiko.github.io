---
layout: post
title: "Weekend Code Hacker 005"
subtitle:  "Simple container hosting, how tough is it?"
date: 2019-07-27
categories:
---

Recently my thoughts have been occupied with the notion of the easiest way
for me to get my myriad side projects hosted and into the cloud. I
absolutely love working with [Kubernetes](https://kubernetes.io) and
[OKD](https://okd.io)(community version of [OpenShift](https://openshift.com))
but I find them to be a little much for my modest personal needs. I know
that there are several places offering commercial deployments of a variety
of Kubernetes distributions, but I have not found one that I am comfortable
with, and that fits within my proposed budget.

Ideally, I want a simple virtual machine _somewhere_ in the cloud where I can
deploy container infrastructures and then bind external services to domain
names. I know from experience that OKD makes this just _way_ too easy for me
and I'm probably spoiled because of it. But what would it really look like to
build a minimal system that I could administer for myself and friends who
want to run simple web applications?

Thus, I have been thinking about a simple container hosting architecture and
I'm going to experiment with building it. Here are some of the high points
I would like to hit with this system:

* Host machine is deployed with [Ansible](https://ansible.com). This will make
  it easy for me to teardown and redeploy when necessary.
* Users specify the containers they want to run through configuration that is
  stored in a version control repository. As with the system deploy, this will
  make it easier to recover from disaster and provide structure for the
  deployments.
* Containers managed with [Podman](https://podman.io). I think this is one of
  the best container runtime projects out there and I would like to see it at
  the heart of this system. It's got great support for tooling around it that
  will make automation a breeze for me.
* Incoming traffic handled with [HAProxy](https://www.haproxy.org/). Aside
  from being one of the primary projects in this area, I also found that the
  feature set should fit my purposes well.
* All incoming traffic encrypted with TLS using [Let's Encrypt](https://letsencrypt.org/)
  certificates. This will allow us to keep costs low and there is ample tooling
  to support automation around certification creation and revocation.
* Host operating system using a container focused distro like
  [Fedora CoreOS](https://getfedora.org/coreos/) or similar. I think the work
  going on in the Fedora and CentOS communities around cloud enablement and
  security to be exceptional, and I would like to get the maximum benefit from
  that work.

Here is a simple diagram of what the architecture might look like:

<img src="/img/simple-container-host.svg" class="img-responsive center-block" alt="simple container host architecture">

The idea being that HAProxy will run in a container that can be reconfigured
whenever a new container application needs to be exposed, or certificates
need updating, or whatever. The application containers (shown as "Cool Site Container"
and "Snazzy Site Container") will be deployed to listen on separate ports in the
container network internal to the machine (read: not exposed to outsite world
directly).

Ok, so I'm basically re-engineering other tooling in this space
(hello [k3s](https://k3s.io/) o/), but what fun would it be to just grab
something off the shelf ;)

Further, I think this is a system that could be really easy to assemble and
maintain. It could be done on a single virtual machine, and potentially give
the users a very easy mechanism to run web applications with secure, domain-based
routing.

I still have some thoughts about how exactly the containers will be deployed,
I am considering an approach where users would login to a shell account and
be responsible for their own services. But, that sounds more error prone and
I certainly don't want to create hassle for _anyone_. On the other hand, it
would give users maximum flexibility.

Regardless of the approach, I will continue to give updates here as I make
progress :fingers crossed:, and naturally all the artifacts I produce will be open source =)

shoutouts to @ManyAngled and @mdszy for some great discussion on this topic!

as always, happy hacking o/
