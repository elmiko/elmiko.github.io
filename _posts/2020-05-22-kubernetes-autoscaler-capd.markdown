---
layout: post
title: "Debugging the Kubernetes Autoscaler using Cluster API and Docker"
subtitle:  ""
date: 2020-05-22
categories:
---

In my [previous post](https://notes.elmiko.dev/2020/04/17/exploring-cluster-api.html)
I gave a little background on the Cluster API(CAPI) project and showed how I configure
and deploy Kubernetes clusters using the Docker provider. In this post I want to
take this further and talk about how to integrate the
[Kubernetes Cluster Autoscaler](https://github.com/kubernetes/autoscaler) into
this configuration, and why I want to do this integration.

To start with, let's take a look at how the autoscaler works for non-CAPI
providers. Here is a very high level look at the autoscaler architecture and
deploymnet:

<img src="/img/k8s-autoscaler.svg" class="img-responsive center-block" alt="Kubernetes Autoscaler Architecture">

This diagram shows a single Kubernetes cluster running on a cloud provider. The
autoscaler is deployed as a Pod running inside the cluster. It has the ability
to monitor the Pod and Node objects in the cluster, and also the ability to
interact with the cloud provider. Using these abilities the autoscaler will
attempt to watch for unscheduled Pod resources, and underutilized Node resources.
When it sees these conditions, it will attempt to adjust the cluster size by
requesting more resources from the provider(which will become Nodes), or by
removing Nodes from the cluster.

As you might imagine, each one of these operations by the autoscaler are very
sensitive to the specific requirements of the cloud provider. What works on
Amazon will not necessarily work on Google. For this reason the autoscaler
contains [several provider implementations](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/cloudprovider)
, each with the unique information and workflows for that provider.

Recently, the CAPI provider [has been merged](https://github.com/kubernetes/autoscaler/pull/1866)
into the core autoscaler code. This means that users can now user CAPI as a
provider, which opens up a new avenue as a provider abstraction.

## Cluster API + Autoscaler = ?

CAPI uses declarative resources to specify how a cluster topology should be
configured. It uses Cluster objects at the highest level, and then MachineDeployments
and MachineSets, and lastly Machines at the lowest level. The controllers and
applications that make up CAPI are looking for these resources and will respond
with action when they see changes. The default assumption for CAPI is that
you will have a management cluster that can own several Cluster resources, and
through this mechanism could manage a fleet of Kubernetes deployments.

The CAPI provider for the autoscaler likewise uses MachineDeployments, MachineSets,
and Machine objects as the core of its workflow. But, as we see from the previous
diagram the autoscaler wants to talk directly to the cloud provider for resources
it is watching within the cluster. As you might have realized this abstraction
starts to break down if our management cluster is separate because the autoscaler
will be creating resources that no controller is watching.

To make this integration work the CAPI management cluster needs to be merged
with the workload cluster. With the final result looking something like this:

<img src="/img/k8s-autoscaler-capi.svg" class="img-responsive center-block" alt="Kubernetes Autoscaler CAPI Architecture">

Thankfully, the CAPI project has already thought about this and created a workflow
and tooling for merging the management cluster with a workload cluster.

## Putting it all together

Ok, so now you should have an impression of how these projects fit together
from the theoretical level. Let's look at a practical case.

In my last post I showed how to use the Docker provider with CAPI. This provider
is mainly used for testing CAPI, but I think it has some great practical applications
for testing the autoscaler as well. My eventual goal is to help create some end-to-end
tests for the autoscaler that we can use more frequently for merge requests. Currently
the tests are expensive to run as they require the use of physical cloud providers.
The Docker provider offers us an opportunity to create a lower resource consumption
option for testing the core pieces of the autoscaler. Mind you, this is not a
substitute for individual provider test but an augment to them.

So, how do we do it?

<div class="alert alert-info" role="alert">
<strong>Note</strong>
These instructions assume that you have built the CAPI pieces from source. Further
you will need to use at least version <strong>0.3.5</strong> as there is a change for the DockerMachineTemplate
to allow the use of the extraMounts field.
</div>

Step 1, Follow my [previous post](https://notes.elmiko.dev/2020/04/17/exploring-cluster-api.html)
to get working management and workload clusters. One thing to keep in mind is that
you will need to use a version of the `cluster-template.yaml` file that is similar
to [this one from the 0.3.5 release](https://github.com/kubernetes-sigs/cluster-api/blob/master/test/e2e/data/infrastructure-docker/cluster-template.yaml).
_One note about the manifest produced for the workload cluster, make sure
to check the replicas for the `*-md-0` MachineDeployment. You will probably
want at least 1 replica._

After you have both Kind clusters running, the next thing to do is join the
management cluster to the workload cluster. Before we can run the join command
though, we need to make sure that the workload cluster has the proper image
in place for CAPI to operate.

This command will load the workload cluster with the CAPI image
(remember, I have built this image locally):
```
kind load docker-image gcr.io/k8s-staging-capi-docker/capd-manager-amd64:dev --name work-cluster
```

Next, initialize the CAPI components in the workload cluster:
```
clusterctl init --kubeconfig work-cluster.kubeconfig \
                --core cluster-api:v0.3.0 \
                --bootstrap kubeadm:v0.3.0 \
                --control-plane kubeadm:v0.3.0 \
                --infrastructure docker:v0.3.0
```

The workload cluster is now ready to receive the CAPI objects from our management
cluster, we can perform the migration with this command:
```
clusterctl move --to-kubeconfig work-cluster.kubeconfig
```

At this point the workload cluster should be hosting all the CAPI components
and is able to manage itself. The last thing I do in this step is to remove
the original cluster and set my new Kuberenetes configuration:

```
kind delete cluster --name clusterapi
EXPORT KUBECONFIG=${HOME}/work-cluster.kubeconfig
```

I should now be able to look at just the single cluster.

```
[mike@localhost ~]$ kubectl get nodes
NAME                                              STATUS   ROLES    AGE     VERSION
work-cluster-work-cluster-control-plane-xmcw8     Ready    master   5m2s    v1.17.2
work-cluster-work-cluster-md-0-79d8558475-kmh5h   Ready    <none>   4m18s   v1.17.2
[mike@localhost ~]$ kubectl get machines
NAME                                 PROVIDERID                                                   PHASE
work-cluster-control-plane-xmcw8     docker:////work-cluster-work-cluster-control-plane-xmcw8     Running
work-cluster-md-0-79d8558475-kmh5h   docker:////work-cluster-work-cluster-md-0-79d8558475-kmh5h   Running
```

So far so good. Next step is to add the autoscaler into the mix. For this part
of the process I build the autoscaler locally and run it against the cluster. It
is possible to put the autoscaler in a container and run it inside the cluster,
but for my debugging purposes I prefer to run local. If you need some help
building the autoscaler, please see the [upstream docs](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
and [my post on building for Fedora](https://notes.elmiko.dev/2020/03/02/building-autoscaler.html).

With the autoscaler built, I start it with the following command:
```
./go/src/k8s.io/autoscaler/cluster-autoscaler/cluster-autoscaler \
        —logtostderr \
        --v=4 \
        --cloud-provider=clusterapi \
        --namespace=default \
        --expendable-pods-priority-cutoff=-10 \
        --max-nodes-total=24 \
        --scale-down-enabled=true \
        --scale-down-delay-after-add=10s \
        --scale-down-delay-after-delete=10s \
        --scale-down-delay-after-failure=10s \
        --scale-down-unneeded-time=23s \
        --balance-similar-node-groups \
        --max-node-provision-time 10m \
        --kubeconfig=${KUBECONFIG}
```

After starting you should see a bunch of log output and hopefully it will
connect to your cluster. You should be able to see messages about scaling
operations and unschedulable pods.

At this point you are running the autoscaler against a Docker backed Kubernetes.
take a moment to enjoy the feeling.

## Ok it works, now what?

With the autoscaler running you may be wondering how to engage it to watch
the action. The first thing you will most likely want to do is create a new
MachineDeployment that the autoscaler can operate on. To do that you can
use a manifest similar to this one:

```
apiVersion: cluster.x-k8s.io/v1alpha3
kind: MachineDeployment
metadata:
  name: work-md-1
  namespace: default
  annotations:
    cluster.k8s.io/cluster-api-autoscaler-node-group-min-size: "1"
    cluster.k8s.io/cluster-api-autoscaler-node-group-max-size: "4"
spec:
  clusterName: work-cluster
  replicas: 1
  selector:
    matchLabels: null
  template:
    spec:
      bootstrap:
        configRef:
          apiVersion: bootstrap.cluster.x-k8s.io/v1alpha3
          kind: KubeadmConfigTemplate
          name: work-md-0
      clusterName: work-cluster
      infrastructureRef:
        apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
        kind: DockerMachineTemplate
        name: work-md-0
      version: v1.17.2
```

The important thing to note here are the annotations. These are what will
inform the autoscaler about the size restrictions on the MachineDeployment.
As an alternative to creating this MachineDeployment you can add these
annotations to the original work MachineDeployment to see how it scales.

Even though the autoscaler is watching your cluster at this point, there is
probably not much happening. To fix this you will want to create a workload
to experiment with and watch the autoscaler do its thing. I use this manifest
as a template for an artifical workload:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scale-up
  labels:
    app: scale-up
spec:
  replicas: 1
  selector:
    matchLabels:
      app: scale-up
  template:
    metadata:
      labels:
        app: scale-up
    spec:
      containers:
        - name: busybox
          image: docker.io/library/busybox
          resources:
            requests:
              memory: 2Gi
          command:
            - /bin/sh
            - "-c"
            - "echo 'this should be in the logs' && sleep 86400"
      terminationGracePeriodSeconds: 0
```

Once deployed you can adjust the replicas to see how much it takes to push
the cluster to expand.

## Demo time!

I hope these instructions have worked for you, but if not, or if you would like
more context and inspiration, here is a demo I gave at the
[April 29th CAPI meeting](https://www.youtube.com/watch?v=vJ-fgkHR7Fk).

<iframe src="https://player.vimeo.com/video/421622583" class="center-block" width="640" height="357" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
<p></p>

So, that's about all I've got to say on this topic for today. I hope this information
is helpful and that you can start messing around with the autoscaler internals yourself.
Stay safe and healthy out there, and as always, happy hacking =)
