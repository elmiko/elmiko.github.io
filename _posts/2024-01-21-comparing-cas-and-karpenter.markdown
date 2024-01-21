---
layout: post
title: "Comparing the Kubernetes Cluster Autoscaler and Karpenter"
subtitle:  ""
date: 2024-01-21
categories:
---

Over the last couple years, the [Karpenter project][karp] has been gaining
popularity and momentum in the Kubernetes community. It is often spoken about
in the same breath as the [Cluster Autoscaler][cas](CAS), and is commonly
viewed as a node autoscaler. There are nuanced differences between the two
projects that make this equivalence slightly inaccurate and I'd like to
explore and highlight those differences.

## A little background for context

To start with though, why am I even talking about this?

As part of my `$JOB` at Red Hat I spend a great deal of time working on the
CAS; mostly doing maintenance and ensuring that the [Cluster API][capi]
provider has as few bugs and as many features as possible. I am also working
with the Cluster API communuity's [Karpenter feature group][ck-fg] to understand
how we can integrate these projects while preserving the core features from
both. On top of that, I have been interested in distributed systems and
cloud infrastructures for many years and find the topic of autoscaling to be
fascinating.

I get asked a lot of questions about CAS and Karpenter and I thought it would
be worthwhile to write something a little more durable and public to help
share my perspectives and opinions. That said, what is written here is my
opinion based on reading documentation and source code, and by operating
the projects. I highly recommend reviewing the
[Kubernetes Cluster Autoscaler FAQ][cas-faq] and
[Karpenter Concepts][karp-concepts] documentation pages as many details can
be gleaned from these sources. I will also note that my bias is solidly rooted
in the maintenance of the Cluster API provider for CAS and building a Cluster
API integration for Karpenter, _caveat emptor_.

## What's in a name?

To start with, let's look at the names of the projects: Cluster Autoscaler,
and Karpenter. A Cluster Autoscaler is something that will automatically scale
your cluster. This clearly implies that I have a cluster and somehow the nodes
in it will be scaled. Meaning that I can have more, or fewer, of the nodes that
I already have based on some sort of calculation. Fairly straightforward.

On the other hand, a Karpenter (carpenter) is someone who builds things out
of wood. I interpret this to mean that the project implies it will be building
things, in this case Kubernetes nodes. So, instead of viewing Karpenter as
an application that will scale the existing nodes in my cluster, it might be
more accurate to view it as a node builder that can provision new nodes in
the cluster based on what the workloads of the cluster need.

## Scaling and provisioning

What does it mean that the CAS will scale things and Karpenter will provision
things?

When configuring the CAS for use, one thing the user must do is to configure
the node groups that will be available for CAS to manipulate. The
configuration is highly provider specific and is required for the CAS to
understand what types of nodes it can scale. For example, with the Cluster API
provider this process involves the user adding specific annotations to their
scalable resources (`MachinePool`, `MachineDeployment`, `MachineSet`) to instruct
the CAS about scaling inclusion and limits.

By contrast, when configuring Karpenter the user must specify what constraints
will apply when determining how pods will fit onto specific instance types
and categories. This means that Karpenter can understand what types of
instances will become nodes that a specific pod can be scheduled to, and then
it can check the infrastructure inventory to determine if an instance can be
created to contain the pod. An example of this can be seen in how the
[Karpenter AWS provider can use EC2 Fleet][karp-fleet] to find many
instances which might fit the pod (or group of pods) and then choose the best
option based on user preferences.

Allowing the application to understand provisioning instead of scaling also
lends itself to more dynamic discovery of instance types and categories at run
time. This means that as cloud inventory changes, Karpenter can react to those
changes automatically and make moment-to-moment decisions about market
availability and pricing. By contrast, to emulate this behavior using the CAS
with Cluster API would require the user to be updating the
`InfrastructureMachineTemplate` resources in their cluster as well as updating
the associated scalable types on a continual basis.

## When to activate, pending or unscheduled?

Another subtle point of difference that flows from the notion of scaling
versus provisioning is the conditions under which these applications will jump
into action.

When there are pending pods in a cluster, this means that there
is a node available which could receive the pod but that it currently does not
have allocatable capacity. In these cases, when configured, the CAS and
Karpenter both have the ability to  add more nodes of the type that will accept
the workload.

When there are unschedulable pods in a cluster, this means that there are no
nodes that can satisfy the requirements of the pod. In these cases the CAS
will only act if it has a node group which could possibly make a node to
schedule that pod. This scenario can happen when the CAS is configured to
have node groups of size zero and thus there are no nodes in the cluster which
could schedule the pod, but the CAS knows how to make that type of node.

Karpenter, by contrast, is configured by the user to instruct the provisioning
of nodes based on pod constraints. In the case of an unschedulable pod,
Karpenter will refer to its provisioners, and will then request several
instance types which could satisfy the pod requirements. Karpenter can then
choose the best (by cost, resource, availability, etc) instance type to create
as the pod is being requested.

This is not to say that the CAS won't also look at several instance types when
deciding which to make, but we need to look at the details a little closer to
understand that choice. In Karpenter, having the ability to calculate instance
types based on the workload constraints means that it can request a broad
range of instances (limited by user configuration) from the infrastructure. By
contrast, CAS can be configured with many instance types and when presented
with a decision about which type of instance to request for a specific workload
it will use the user's preference (up to and including [custom code][cas-grpc])
to make that choice. The CAS is limited by its node group configurations,
which are different on each platform, and may or may not support dynamic
instance discovery and full resource and cost data.

In both cases, CAS and Karpenter, the user has control over the options for
how nodes are chosen, with preferences and priorities across several ranges
such as pricing and resource consumption.

## Disrupting behavior and bin packing

Another topic that comes up frequently when talking about Karpenter is
[bin packing][binpack]. Bin packing in this context refers to the
algorithms that a program uses to fit items into a set of groups (bins)
based on arbitrary constraints. Both CAS and Karpenter use bin packing when
calculating how pods could fit into the possible node choices available. What
people are most frequently referring to when talking about bin packing and
Karpenter is its [consolidation and disruption features][disrupt], which the
CAS does not replicate.

A frequent problem with distributed systems that have workloads which come and
go over time, is that the cluster can become sparsely populated. As workloads
are removed and not replaced they leave _holes_ in the nodes. This in turn
causes nodes within a cluster to become underutilized. In
these situations an activity is required to rebalance the workloads and
resources in the cluster to optimize usage. CAS and Karpenter both have
features to help address this problem, with Karpenter providing a more active
approach.

When using the CAS, users have the ability to configure node resource
utilization thresholds and inactivity timers. Resource usage is calculated
based on summed pod resource requests compared to node allocatable capacities.
When utilization falls below the threshold, a node is cordoned and drained, to
allow for graceful termination before being removed. The inactivity timer
provides the mechanism for dictating how long underutilized nodes should
persist in the cluster. CAS is not doing any explicit rebalancing of workloads
during this scale down, it is only removing underutilized nodes. Any pods
disrupted during a node removal will be rescheduled by Kubernetes.

Karpenter provides users with more options than CAS for defining how the cluster
will remove and replace nodes, it refers to these events as consolidation and
disruption. In the example of sparse workloads from above, Karpenter can
consolidate the cluster on a user defined schedule, preferring to choose instances that
are cheaper or more resource efficient. This consolidation activity will repack
pods within the cluster (using the Kubernetes scheduler) to replace inefficient
node configurations. Karpenter also allows users to replace
nodes based on cluster configuration skew, age of node in the cluster, and manual
intervention. Aside from manual intervention, the CAS does not provide an interface
for configuring arbitrary node replacement based on user defined conditions.
In all cases, when Karpenter removes nodes it follows an orderly eviction process
to allow for graceful node termination.

## Community and SIG engagement

You might have heard around the Kubernetes community that Karpenter has joined
the SIG Autoscaling community. This true!

As of last December, the [Karpenter project core][karp-gh] has been donated to
the Kubernetes Autoscaling SIG for maintenance and contribution. This package
is meant to be used as a library for providers to implement on their platforms.
Currently there are [AWS][karp-aws] and [Azure][karp-azure] implementations.
Hopefully in the future we will have a Cluster API version as well ;)

I think it's important to highlight the provider implementation details in a
little more detail. I am optimistic about building a generic Cluster API
provider that would unlock Karpenter on all the Cluster API platforms, but I
also acknowledge that this might not provide the best experience and there will
be challenges to implementation. Karpenter would like to act as a provisioner
in the cluster, but Cluster API also wants to perform this role. To preserve the Cluster
API experience for users, the Karpenter and Cluster API controllers will need
to cooperate on the provisioning front. Making this interface generic might mean
losing access to some of the powerful cloud interfaces, like EC2 Fleet, which
help to make Karpenter powerful by extension. I'm sure there will be solutions
to these problems, but it's a point of concern that I think about frequently.

In addition to code, the joining of the communities has lead to an advancement
of defining common APIs around cluster lifecycle in relation to node
provisioning and removal. See the
[Cluster Autoscaler/Karpenter API Alignment AEP draft][sig-align] for more
information.

## Is one "better" than the other?

This is a question that I don't think is quite right. Both CAS and Karpenter
are tremendous software applications with many satisfied users. They are
different in approach and features, and I don't think it's fair to proclaim
that one is greater or lesser than the other. I think it's more appropriate to
ask, _which one is better for your use case?_

There is tremendous overlap between the two applications but they do have
different, opinionated, approaches to solving the problem of having
just-in-time resources in Kubernetes. In many respects, Karpenter can be
configured in a manner to perform the same task as CAS, and that cannot be
said in the converse. In this respect Karpenter's features might be seen as
a superset CAS's features.

On the other hand, in clusters where swings in cluster size might be
lower and choice of instance type is not required to be as dynamic, operating
the CAS could prove to be a less complex task. Especially if you have been
using the CAS for years already.

Additionally, CAS currently runs on 28 providers listed in the repository, with
at least 2 of those (Cluster API and OpenStack) being platforms that run on a
multitude of other platforms. Karpenter currently only supports AWS and Azure.

## Caution, strong opinions ahead

Karpenter seems ideal for situations where you want to manage larger
heterogeneous clusters that have high amounts of workload churn. Where resource
maximization and cost reduction are primary drivers to configuring and
optimizing the cluster. In these scenarios, Karpenter's ability to consolidate
and choose from a wide variety of instance types will be very beneficial.

The CAS seems well suited in cases where your cluster has a very reliable rate
of growth, and the instance types are more homogeneous across the cluster. This
applies well in smaller clusters, especially if the need for scaling is only a
single node or two over a short period of time (e.g. bursting for an evening).
It also applies well in clusters where the instances are treated as a large pool
and the specific types are less important, or in situations where having some
overprovisioned capacity is preferred.

I find Karpenter's configuration options to be more complicated than the CAS,
and I'm not sure how hard it is to debug issues with Karpenter as I have much
more time on the CAS. I really like that Karpenter has taken the approach to
use API resources (`NodePool`, `NodeClaim`, etc.) to drive its behavior as I
think it makes it easier to reckon about functionality and exposes more context
to users.

Given the similarities and differences, I think it's really difficult to make
an "apples to apples" comparison between the two. Karpenter really seems to
be positioned as an application that can open the doors on an infrastructure
with a large dynamic inventory. I suppose I am not surprised that this
technology originated at AWS since they specialize in having just such an
inventory. I have a feeling the differences with CAS would be much smaller if Karpenter
were implemented on a platform with a smaller or less dynamic inventory. The
consolidation and disruption features are very nice, and big features for
Karpenter, but I believe some of these activities could be replicated by
well crafted CAS and Kubernetes configurations, use of projects like the
[descheduler][desched], and custom automation. At this point though, these are
just my theories.

I hope my impressions, interpretations, and opinions expressed here have helped
you to figure out what is most beneficial for your needs. If you've
made it this far, I really appreciate it, and as always happy hacking o/


[karp]: https://karpenter.sh
[karp-concepts]: https://karpenter.sh/docs/concepts/
[cas]: https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler
[cas-faq]: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md
[capi]: https://cluster-api.sigs.k8s.io
[ck-fg]: https://github.com/kubernetes-sigs/cluster-api/blob/main/docs/community/20231018-karpenter-integration.md
[karp-fleet]: https://karpenter.sh/v0.33/faq/#how-does-karpenter-dynamically-select-instance-types
[cas-grpc]: https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/expander/grpcplugin
[binpack]: https://en.wikipedia.org/wiki/Bin_packing_problem
[karp-sig]: https://github.com/kubernetes/org/issues/4258
[karp-gh]: https://github.com/kubernetes-sigs/karpenter
[karp-aws]: https://github.com/aws/karpenter-provider-aws
[karp-azure]: https://github.com/Azure/karpenter
[sig-align]: https://docs.google.com/document/d/1rHhltfLV5V1kcnKr_mKRKDC4ZFPYGP4Tde2Zy-LE72w/edit
[desched]: https://github.com/kubernetes-sigs/descheduler
[disrupt]: https://karpenter.sh/docs/concepts/disruption/
