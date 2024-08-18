---
layout: post
title: "Developing the Karpenter Cluster API Provider"
subtitle:  ""
date: 2024-08-18
categories:
---

Since October 2023 I've been working with the [Kubernetes Cluster API][capi] community
to develop a native [Karpenter][karp] provider so that we can explore the behavior
of these projects together. Karpenter is an exciting node auto-provisioner that has features
for configurable cluster consolidation and deep cloud inventory awareness, and Cluster API is
a declarative infrastructure API for Kubernetes with coverage on nearly 2 dozen providers.
If these projects can work well together, it would give the community an excellent way to run
Karpenter on many cloud providers. As of last week, we have reached the minimally
viable implementation for a proof-of-concept, and we are in the
[process of donating the repository][karpissue] to the Kubernetes SIGs community for wider
experimentation and development.

Although we have reached a nice milestone for the project, there is still much work to do
as we attempt to reach feature parity with the native Karpenter implementations. We will also
need to learn how best to integrate Karpenter with Cluster API, where the bottlenecks might be,
and how we can create the best user experience possible.

With the first phase of work complete, it's a nice time to reflect on what we have done and
how we got here. This is especially relevant given that the developer community around Karpenter
is still growing and there are many people interested in implementing providers for other
platforms. In this post, I am going to share the process we used to develop the Cluster API
provider in hopes that it will help others who are making the same journey.

<img src="/img/karpcapi-logo.svg" class="img-responsive center-block" alt="Karpenter Cluster API logo">

## Planning the foundation

To help us solve problems of architectural constraints, project goals, and user experience options,
we started a [Karpenter feature group][karpfg] in the Cluster API community where we had a regular time
and space to have and record our discussions and decisions. It took us a few months to arrive at a
design and initial plan for how we would create the proof-of-concept Karpenter. This process was hugely beneficial
as it gave us ample opportunity to talk through the software constraints that the Cluster API provider
placed on this implementation. In specific, the asynchronous nature of infrastructure creation in
Cluster API is slightly at odds with the synchronous nature of Karpenter's cloud interface.

One of the challenges in writing a Karpenter provider for Cluster API is the limitation of needing
to use the Kubernetes API for making changes to the infrastructure. This means that any time we
want to learn about the inventory or status of the infrastructure resources, we need to query the
Kubernetes API and potentially exercise reconciliation loops to ensure that asynchronous behavior
is captured accurately. This is in stark contrast to infrastructure providers where there is
direct access to a metadata service with synchronous responses.

In addition to the engineering concerns around designing an integration between Cluster API and
Karpenter, there is also a necessary focus on how to expose the API features of both projects. Cluster API
and Karpenter are both provisioning tools built on top of Kubernetes, and this means that they
have some overlap in the features they expose. A point of discussion that we spent several meetings
exploring was the idea of where on the spectrum of "Cluster API to Karpenter" does the community want the
user experience. Given the nature of Cluster API, I feel this specific design concern will most
likely not be an issue for other provider implementers, unless those providers have a user community
that expects a deep interaction with the platform APIs.

## Initial code and trajectory

With the plans solidified and the community in consensus about our initial direction, I started to
build a skeleton repository for the project. I did this by copying the [Kwok provider][kwok] from
the [Karpenter repository][karprepo] into a new repository, and then building a simple Makefile and
the necessary Go files to build the project. At this point I had a basic buildable project and could
begin the next step of defining the boundaries for the code changes that would be needed.

The Karpenter developers have created a straightforward interface that providers must implement. In
general it defines functions that provide information about the infrastructure inventory and resources,
and functions to manage the nodes of the cluster and the resources. It is small enough to reproduce
here:

```go
// Create launches a NodeClaim with the given resource requests and requirements and returns a hydrated
	// NodeClaim back with resolved NodeClaim labels for the launched NodeClaim
	Create(context.Context, *v1.NodeClaim) (*v1.NodeClaim, error)
	// Delete removes a NodeClaim from the cloudprovider by its provider id
	Delete(context.Context, *v1.NodeClaim) error
	// Get retrieves a NodeClaim from the cloudprovider by its provider id
	Get(context.Context, string) (*v1.NodeClaim, error)
	// List retrieves all NodeClaims from the cloudprovider
	List(context.Context) ([]*v1.NodeClaim, error)
	// GetInstanceTypes returns instance types supported by the cloudprovider.
	// Availability of types or zone may vary by nodepool or over time.  Regardless of
	// availability, the GetInstanceTypes method should always return all instance types,
	// even those with no offerings available.
	GetInstanceTypes(context.Context, *v1.NodePool) ([]*InstanceType, error)
	// DisruptionReasons is for CloudProviders to hook into the Disruption Controller.
	// Reasons will show up as StatusConditions on the NodeClaim.
	DisruptionReasons() []v1.DisruptionReason
	// IsDrifted returns whether a NodeClaim has drifted from the provisioning requirements
	// it is tied to.
	IsDrifted(context.Context, *v1.NodeClaim) (DriftReason, error)
	// Name returns the CloudProvider implementation name.
	Name() string
	// GetSupportedNodeClasses returns CloudProvider NodeClass that implements status.Object
	// NOTE: It returns a list where the first element should be the default NodeClass
	GetSupportedNodeClasses() []status.Object
}
```

The first thing I did after getting the project building was to stub out these functions and have them
all return the equivalent of a zero response or an error. In this way, anyone looking at the code
could easily seen what was implemented and what was not. I also added a README file to the project with
a checklist showing which interfaces were implemented. I then set off on the task of implementing the
individual functions.

In the case of Cluster API, one of the things I spent a significant amount of time on was figuring out
how to translate capacity, geographic, and pricing data from the instance types to the Karpenter API types.
This might not be as big a problem on platforms with direct access to a metadata service, but given the
abstracted nature of Cluster API it posed a challenge in writing some of the functions. I am sure this will
be a point of investigation and perhaps expansion in the Cluster API project as we learn more about how
to expose deep infrastructure metadata.

One of the biggest challenges for Cluster API is the implementation of the `Create` method. In Cluster API
the creation of new Machines (the API type associated with a Node's instance) is controlled by a scale
subresource on another API type. This relationship is similar to that of a Pod to a ReplicationController or
Deployment in that an increase in a replica count will trigger the creation of new resources. This means
that we must increase the replica count, and then wait for the Machine resource to be created before we
know the identifying information about the infrastructure resource. Karpenter, in contrast, would like to
know that identifying information when `Create` returns, and this causes the synchronicity issue between the two.

When learning about how to implement the interface functions and what Karpenter expected from them, I spent
much time exploring the [core Karpenter repository][karprepo], but I also studied the way that the
[AWS provider][awscp] and [Azure provider][azurecp] implemented their cloud provider interface. This study
helped me immensely to understand what values would be absolutely required and which might be more supplemental.
I also used the code of the [Kwok provider][kwok] as an example, especially early on in development, but as
I got further into testing and debugging I found the AWS and Azure providers to be more useful examples.

Another very helpful resource was the Karpenter community itself. There are several ways to contact
and participate with the [Karpenter working group][karpcomms], and I highly recommend reaching out if you
have questions. I was able to connect with several wonderful and helpful people in the Karpenter community
by asking questions on their Kubernetes Slack channel (#karpenter-dev) and by attending their meetings with
questions and announcements on their agenda.

### A note on code structure

Something that I found helpful when sketching out the initial structure for the code of the project was
considering how the AWS and Azure providers were constructed. Looking at their designs from the cloud provider
interface down, it was quick to see that they were both following a similar pattern. In specific the
abstraction between the cloud provider interface functions and the various resource and data provider
functions is worthy of note for designing new implementations.

## Handling custom resources

Karpenter requires a few custom resource definitions in order to operate. Notably the NodePool and NodeClaim
definitions, but it will also need some sort of NodeClass implementation for the provider. I found the
pattern for inclusion to be straightforward in the AWS and Azure projects, namely including the YAML manifests
in a subdirectory of the API code. Following this pattern seemed like the easiest way to keep consistency
for developers who might be inspecting the Cluster API provider in the future. To make it even easier, I added
some scripting to the makefile to make the generation of those manifests a little easier by rendering them
directly from the vendored dependencies.

Checking the custom resource definition manifests in to the code repository makes automating the testing
much easier and also including things like helm charts and other examples. In addition
to creating the core Karpenter manifests for NodePool and NodeClaim, the repository will also need to contain
any platform specific manifests, such as the NodeClass implementation.

A design question that came up during development was around the lifecycle of Karpenter's NodePool and NodeClaim
resources, and how they could be used to carry provider specific information. To be clear, both the NodePool and NodeClaim objects
are created and reconciled types within the Kubernetes API, and as such you can build other controllers to
interact with them. Both the NodePool and NodeClaim are also free to carry provider specific information in the
form of annotations and labels, as you might expect from any other API object. In my experience, I did not
have to implement any specific functions for controlling the lifecycle of the Karpenter resources, they are
all handled by the core Karpenter controllers.

## Testing

For Cluster API, testing gave me tremendous confidence in the code that we were building. A big advantage
for Cluster API in this area is that we could use [kubebuilder's envtest][envtest] package to great effect
since most of the platform interactions would happen through Kubernetes resources.

Using examples from kubebuilder and some other projects, I was able to quickly configure a test suite that
could exercise all of the cloud provider interface functions. This ultimately became a foundation point for
the project as it gave me great confidence when bringing the code out of testing and on to a live cluster
environment.

Testing should be a core of whatever provider is being built, but depending on the provider, and perhaps the
maturity of tooling, it may be more difficult to mock out the infrastructure specific parts of instance
management. This is something to consider and plan for when building a new provider implementation.

## Proof of concept

After nearly 3 months of design and coding, we achieved the initial proof-of-concept version of the Karpenter
Cluster API provider. There were a few minor bumps to smooth out as integration testing began, but thanks to
the unit testing the fixes were quick to implement and before long I was able to demonstrate the application
in action.

<iframe class="center-block" width="560" height="315" src="https://www.youtube.com/embed/BZz5ibGP7ZQ?si=DlwNO2O8-nuGNti7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Future plans

This is just the beginning. The most basic functionality is working but there are still several open questions:

* will we need a more reactive, asynchronous, design for Machine creation?
* how will price data be exposed on Cluster API objects?
* can we implement the opt-in scale from zero capacity information for each provider?
* is it possible to use efficient native interfaces like EC2Fleet and VMSS?
* how will kubelet and user data configuration changes be handled?
* can drift be implemented?

And those are just a few of the top issues, there will be plenty more as we start to explore the
behavior of this integration. I am quite happy and curious to see how things go from here and what the
community would like to see from this project.

If you would like to get involved, please see the [Cluster API community book][capicomms] for more
information on how to contact people and where to follow. Also, please follow the
[migration pull request for the repository][karpissue] to see when the
repository will be adopted into the Kubernetes SIGs organization. Assuming the migration goes through, we
will have the common Kubernetes contribution process setup there with plenty of issues to share.

Although there are many members of the Cluster API and Karpenter communities who participated in the
design and development of this project, I would like to give a special mention to GitHub user @daimaxiaxie who
contributed some very timely patches and collaborated on some tricky code issues. Thank you, I am grateful
for your help!

Hopefully this has been helpful for those of you who might be building your own Karpenter provider, or who are just
interested in open source software development. The biggest takeaway from this experience that I can share is
that reading the other providers' code as examples helped me tremendously, it took time to study their sources but I
feel it made my understanding of Karpenter better and gave me more confidence about what we were building.
Have fun out there and as always, happy hacking =)

[karpfg]: https://github.com/kubernetes-sigs/cluster-api/blob/main/docs/community/20231018-karpenter-integration.md
[capi]: https://cluster-api.sigs.k8s.io
[karp]: https://karpenter.sh
[karpissue]: https://github.com/kubernetes/org/issues/5097
[cloudprovider]: https://github.com/kubernetes-sigs/karpenter/blob/main/pkg/cloudprovider/types.go
[kwok]: https://github.com/kubernetes-sigs/karpenter/tree/main/kwok
[karprepo]: https://github.com/kubernetes-sigs/karpenter
[awscp]: https://github.com/aws/karpenter-provider-aws/blob/main/pkg/cloudprovider/cloudprovider.go
[azurecp]: https://github.com/Azure/karpenter-provider-azure/blob/main/pkg/cloudprovider/cloudprovider.go
[envtest]: https://book.kubebuilder.io/reference/envtest.html
[capicomms]: https://cluster-api.sigs.k8s.io/introduction.html?highlight=meeting#-community-discussion-contribution-and-support
[karpcomms]: https://karpenter.sh/docs/contributing/
