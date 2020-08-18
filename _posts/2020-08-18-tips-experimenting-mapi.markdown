---
layout: post
title: "Tips for Experimenting with the OpenShift Machine API"
subtitle:  ""
date: 2020-08-18
categories:
---

As part of `$DAY_JOB`, I spend much of my time hacking on and reviewing a
couple pieces of Kubernetes machinery. The [cluster autoscaler](https://github.com/kubernetes/autoscaler),
the [Cluster API project](https://github.com/kubernetes-sigs/cluster-api), and
the related components in [OpenShift](https://github.com/openshift). Something
that I am working on is becoming a better _user_ of these projects, and ideally
through this process I will be better able to connect with user concerns and
experiences.

One thing I am getting more comfortable with is replacing core components of
OpenShift on a running cluster. This gets especially sensitive when I need to
change the Machine API operator or one of the cloud controllers which operate
as the linkage between Kubernetes and the cloud provider infrastructure.

With all that said, here are a few pieces I've picked up so far that I want
to share in hopes that it will inspire others to experiment and debug on
OpenShift.

## Preparing for big changes

At the heart of OpenShift is an operator called the
[Cluster Version Operator](https://github.com/openshift/cluster-version-operator).
This operator watches the deployments and images related to the core OpenShift
services, and will prevent a user from changing these details. If I want to
replace the core OpenShift services I will need to scale this operator down.

**Scaling down the cluster version operator**
```
oc scale --replicas=0 deploy/cluster-version-operator -n openshift-cluster-version
```

To confirm that it is scaled down, you can check the pods in the `openshift-cluster-version`
project.

## Changing component images

There are a couple different ways to test out experimental changes to the Machine
API components. One method is to run them locally with a Kubernetes config pointing at
your cluster. This is nice when you might want try to step debug an issue with
your component, but it does not give us an accurate portayal of how these
components are used in the cluster. Additionally, it is possible to see latency
errors if your network connection has issues.

The other method is to create images for your components and then have the cluster
load them using the normal methods. I tend to prefer this in general as it allows
me to operate the cluster as it is intended without the need for a remote component.
But, in order to do this properly I need to change a couple records so that the
internal self-healing automation does not replace my custom images.

The `openshift-machine-api` project contains all the resources and components
that are used by the Machine API. There is a ConfigMap named `machine-api-operator-images`.
This ConfigMap contains references to all the images used by the
[Machine API Operator](https://github.com/openshift/machine-api-operator), it uses
these to deploy the controller and ensure they are the proper iamges. The ConfigMap
looks something like this:

**ConfigMap machine-api-operator-images**
```
apiVersion: v1
kind: ConfigMap
data:
  images.json: |
    {
        "machineAPIOperator": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerAWS": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerOpenStack": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerLibvirt": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerBareMetal": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerAzure": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerGCP": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerOvirt": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "clusterAPIControllerVSphere": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalOperator": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalIronic": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalIronicInspector": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalIpaDownloader": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalMachineOsDownloader": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:...",
        "baremetalStaticIpManager": "quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:..."
    }
```

I can edit this ConfigMap to change the image targets to use my custom targets. I
won't go into each of these images, but it should be clear what each one does. For
example, the images named `clusterAPI*` are the controllers for each cloud provider.
I edit the ConfigMap with the following command and replace the images I want.

**Edit the machine-api-operator-images ConfigMap**
```
oc edit configmap/machine-api-operator-images -n openshift-machine-api
```

I had to change these image values to ensure that the machine-api-operator
would respect my changes to the controller deployments. It may not be strictly
necessary to chage both places, but it worked for me.

## Replacing the Machine API operator

With my new image information loaded into the ConfigMap, the next thing I might
do is replace the Machine API operator. This operator controls how the specific
cloud controllers are deployed and coordinated. I only change this component if
there is something I am testing.

The easiest way I use to change this operator is to scale down the deployment,
change the image reference in the deployment, and then scale it back up. The
commands I use are:

**Scale and edit the machine-api-operator deployment**
```
oc scale --replicas=0 deploy/machine-api-operator -n openshift-machine-api
oc edit deploy/machine-api-operator -n openshift-machine-api
oc scale --replicas=1 deploy/machine-api-operator -n openshift-machine-api
```

### Scaling the Machine API operator

Although I might not be replacing this operator, there are times when scaling
it down and up will help in other operations. For example, when changing the
cloud provider controller it can be useful to scale down the Machine API operator
so that I can prevent it from performing any action on my cloud controller.
Another reason would be to force a read of the images ConfigMap.

## Replacing the cloud provider controller

Although these instruction appear last, they are usually the primary target
of my testing. With all the other changes made previously, I am now ready
to swap out my cloud provider controller.

There are a couple ways to do this. After I have changed the download reference
in the images ConfigMap an easy way to swap out the controller is to let
the Machine API operator do it for me. I can delete the deployment associated
with the cloud provider controller and then the Machine API operator will create
a new one for me, like this:

**Delete the machine-api-controllers deployment**
```
oc delete deploy/machine-api-controllers -n openshift-machine-api
```

This will take a few minutes but eventually you should see a new controller
deployed running your image.

Another way to change the image is by modifying the deployment to point at our
new image. This also requires the images ConfigMap be updated otherwise you will
see the Machine API operator delete and re-create your deployment. But, if I just
want to modify the deployment I can use these commands:

**Scale and edit the machine-api-controllers deployment**
```
oc scale --replicas=0 deploy/machine-api-controllers -n openshift-machine-api
oc edit deploy/machine-api-controllers -n openshift-machine-api
oc scale --replicas=1 deploy/machine-api-controllers -n openshift-machine-api
```

Again, within a few minutes you should see the new deployment running your images.

## Last words and gotchas

I hope these brief instructions give a good window into how OpenShift can be
tweaked at the core layers. Before I wrap this up there are a few warnings I
feel compelled to share.

**Gotchas**
* Be careful with this stuff, you are modifying how your cluster talks to the
  cloud and manages its infrastructure.
* If you see your deployments getting deleted and recreated, or your image references
  are not sticking after applied then you should check the state of the cluster-version-operator
  and the machine-api-operator. Those 2 are most likely trying to heal the cluster
  and prevent you from breaking it ;)

Hopefully this has been a fun and _somewhat_ educational read, good luck and
as always happy hacking!
