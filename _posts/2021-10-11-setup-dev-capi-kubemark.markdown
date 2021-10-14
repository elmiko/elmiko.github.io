---
layout: post
title: "Setting Up a Development Environment for the Cluster API Kubemark Provider"
subtitle:  ""
date: 2021-10-11
categories:
---

*Note: at the time of writing, these instructions are using 0.4.2 Cluster API and 1.21.1 kubernetes*

I think there has been some really cool development happening in the
[Cluster API](https://cluster-api.sigs.k8s.io) community around testing. I know
that might not sound like the most exciting thing, but from the perspective of
someone who spends large amounts of time developing, running, and debugging things
like the [Kubernetes cluster autoscaler](https://github.com/kubernetes/autoscaler),
having a method for building lightweight clusters for testing is invaluable.
I'll explain this idea more deeply, but first a little background.

Earlier this year, the Cluster API community had started developing a Kubemark
provider. It had started as a project in its own repository, then was brought
into a pull request on the main repository. Recently though, the community
has decided to push forward with the separate repistory and we have added a few
more maintainers to the project.

So, the community is fully behind the
[Cluster API Kubemark Provider](https://github.com/kubernetes-sigs/cluster-api-provider-kubemark/)
and we are ramping up development there and working towards having some automated
image builds and updates to the latest Cluster API version.

Now, back to the original thought, why is using Kubemark with Cluster API important?

Let's start with what Kubemark is, and what it can do.
[Kubemark](https://github.com/kubernetes/kubernetes/tree/master/cmd/kubemark) is
an application that allows you to create "hollow" Kubernetes nodes. What this means
is that the nodes do not actually run containers or attach storage, but they do
_behave_ like they did, with updates to etcd and all the trimmings.

This allows a user to create a cluster of kubemark nodes and then exercise their
applications that manage nodes and other infrastructure pieces, and these components
can be tested in isolation from the actual infrastructure provider. For testing
an application like the cluster autoscaler, this is perfect as it allows us to
exercise the main mechanisms of pending pods and node utilization without worrying
about the underlying infrastructure. It can also
be very helpful for testing the core Cluster API controllers, as well as other
controllers like the Machine Health Checker.

As I have been doing a lot of work around the autoscaler and Cluster API communities
in the last year, I am very excited to see what we do next with these tools. To
that end I have needed to setup a reliable environment for working on Cluster API and
kubemark.

## Configuring a host for Cluster API

In the past, I have used Fedora (almost religiously) to create my development environments.
But I have been challenged recently as I hit some blockers involving Docker, SELinux,
and a wierd file system error that lead me to try Ubuntu for my environment this time around.
So, the first thing I did was create a new virtual machine in Boxes on my Fedora workstation ;)

Starting with an Ubuntu 20.10 server, I install the following tools:

* Install Go language.
    `snap install go --classic`
* Install build tools.
    `apt install make gcc`
* Install docker.
    `apt install docker.io`
* Add `$USER` to the docker group, this helps so that I can docker commands from the main user.
    `usermod -a -G docker $USER`
* Install [kind](https://kind.sigs.k8s.io), we will use `kind` for running all the clusters.
    `go get sigs.k8s.io/kind`
* Install kubectl.
    `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"`
* Install kustomize.
    `go get sigs.k8s.io/kustomize/kustomize/v3`
* Install kubebuilder.
    `curl -L -o kubebuilder https://go.kubebuilder.io/dl/latest/$(go env GOOS)/$(go env GOARCH)`

The machine is now setup to build Cluster API and the kubemark provider, also anything else
I might need.

### Install Cluster API

No reason to duplicate the excellent guidance given by the project itself, I usually follow
the [clusterctl for Developers](https://cluster-api.sigs.k8s.io/clusterctl/developers.html)
documentation. I build the `clusterctl` binary, and also the controller images for Cluster API
and the Docker provider.

### Install Cluster API Kubemark provider

Installing the kubemark provider is relatively straightforward, clone the repository and
then build the images locally.

1. `git clone https://github.com/kubernetes-sigs/cluster-api-provider-kubemark`

2. `make docker-build REGISTRY=localhost:5000`. Note the `REGISTRY` variable here, I am using this
   with the [local registry feature in kind](https://kind.sigs.k8s.io/docs/user/local-registry/).

After building the code there are a few bits to setup in the local Cluster API
configuration folder.

I add kubemark to the `$HOME/.cluster-api/dev-repository/config.yaml` file,
the kubemark entry looks like this:
```yaml
- name: "kubemark"
  type: "InfrastructureProvider"
  url: "$HOME/.cluster-api/dev-repository/infrastructure-kubemark/v1.0.99/infrastructure-components.yaml"
```
*Note: you must replace `$HOME` in that path*

I also need to setup `.HOME/.cluster-api/dev-repository/infrastructure-kubemark/v1.0.99/`, this directory
will contain all the configuration and template files for the kubemark provider. I copy the contents
of the [templates](https://github.com/kubernetes-sigs/cluster-api-provider-kubemark/tree/main/templates)
directory, the [metadata.yaml](https://github.com/kubernetes-sigs/cluster-api-provider-kubemark/blob/main/metadata.yaml)
file, and the output of the `make release-manifests` command which should be the
`infrastructure-components.yaml` file.

Check the `infrastructure-components.yaml` file to ensure that the images it is using are
avaible on your system (they should be if you used the build command above). Also
you might want to modify how your kubemark pods start to specify a different kubemark
image than the default. For example, I am using this:

```yaml
spec:
  containers:
  - args:
    - --metrics-addr=127.0.0.1:8080
    - --enable-leader-election
    - --kubemark-image=quay.io/elmiko/kubemark
    command:
    - /manager
    image: localhost:5000/cluster-api-kubemark-controller-amd64:dev
    imagePullPolicy: Always
    name: manager
    resources:
      limits:
      cpu: 100m
      memory: 30Mi
    requests:
      cpu: 100m
      memory: 20Mi
```


## Running the Kubemark provider

If you have followed these instructions you should now have all the necessary images
built in your local docker registry. The next steps involve setting up the kind
cluster, installing the docker provider, and finally running a kubemark cluster.

Make sure to setup the [local registry for kind](https://kind.sigs.k8s.io/docs/user/local-registry/),
then start a kind cluster and install Cluster API similar to the description
in the [clusterctl for Developers](https://cluster-api.sigs.k8s.io/clusterctl/developers.html)
documentation. My initialization command looks something like this:

```
clusterctl init \
  --core cluster-api:v0.4.2 \
  --bootstrap kubeadm:v0.4.2 \
  --control-plane kubeadm:v0.4.2 \
  --infrastructure kubemark:v1.0.99,docker:v0.4.2 \
  --config ~/.cluster-api/dev-repository/config.yaml
```

Once the Cluster API controllers are up and running you can start deploying the
control plane cluster for kubemark. I am currently using this definition:

```yaml
apiVersion: cluster.x-k8s.io/v1alpha4
kind: Cluster
metadata:
  name: km-cp
  namespace: default
spec:
  clusterNetwork:
    pods:
      cidrBlocks:
      - 172.17.0.0/16
    serviceDomain: cluster.local
    services:
      cidrBlocks:
      - 192.168.122.0/24
  controlPlaneRef:
    apiVersion: controlplane.cluster.x-k8s.io/v1alpha4
    kind: KubeadmControlPlane
    name: km-cp-control-plane
    namespace: default
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
    kind: DockerCluster
    name: km-cp
    namespace: default
---
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
kind: DockerCluster
metadata:
  name: km-cp
  namespace: default
---
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
kind: DockerMachineTemplate
metadata:
  name: km-cp-control-plane
  namespace: default
spec:
  template:
    spec:
      extraMounts:
      - containerPath: /var/run/docker.sock
        hostPath: /var/run/docker.sock
---
apiVersion: controlplane.cluster.x-k8s.io/v1alpha4
kind: KubeadmControlPlane
metadata:
  name: km-cp-control-plane
  namespace: default
spec:
  kubeadmConfigSpec:
    clusterConfiguration:
      apiServer:
        certSANs:
        - localhost
        - 127.0.0.1
      controllerManager:
        extraArgs:
          enable-hostpath-provisioner: "true"
    initConfiguration:
      nodeRegistration:
        criSocket: /var/run/containerd/containerd.sock
        kubeletExtraArgs:
          cgroup-driver: cgroupfs
          eviction-hard: nodefs.available<0%,nodefs.inodesFree<0%,imagefs.available<0%
    joinConfiguration:
      nodeRegistration:
        criSocket: /var/run/containerd/containerd.sock
        kubeletExtraArgs:
          cgroup-driver: cgroupfs
          eviction-hard: nodefs.available<0%,nodefs.inodesFree<0%,imagefs.available<0%
  machineTemplate:
    infrastructureRef:
      apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
      kind: DockerMachineTemplate
      name: km-cp-control-plane
      namespace: default
  replicas: 1
  version: v1.21.1
```

Once that is running and I have installed a container network interface (CNI) into
that cluster, the last step for my purposes is to create a MachineDeployment
that will contain more compute plane nodes for the cluster. I use this manifest
and then scale it using either `kubectl` or the cluster autoscaler:

```yaml
apiVersion: cluster.x-k8s.io/v1alpha4
kind: MachineDeployment
metadata:
  annotations:
    cluster.x-k8s.io/cluster-api-autoscaler-node-group-max-size: "5"
    cluster.x-k8s.io/cluster-api-autoscaler-node-group-min-size: "1"
  name: km-wl-kubemark-md-0
  namespace: default
spec:
  clusterName: km-cp
  replicas: 4
  selector:
    matchLabels:
      cluster.x-k8s.io/cluster-name: km-cp
      cluster.x-k8s.io/deployment-name: km-wl-kubemark-md-0
  template:
    metadata:
      labels:
        cluster.x-k8s.io/cluster-name: km-cp
        cluster.x-k8s.io/deployment-name: km-wl-kubemark-md-0
    spec:
      bootstrap:
        configRef:
          apiVersion: bootstrap.cluster.x-k8s.io/v1alpha4
          kind: KubeadmConfigTemplate
          name: km-wl-kubemark-md-0
      clusterName: km-cp
      infrastructureRef:
        apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
        kind: KubemarkMachineTemplate
        name: km-wl-kubemark-md-0
      version: 1.21.1
---
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha4
kind: KubemarkMachineTemplate
metadata:
  labels:
    cluster.x-k8s.io/cluster-name: km-cp
  name: km-wl-kubemark-md-0
  namespace: default
spec:
  template:
    spec: {}
---
apiVersion: bootstrap.cluster.x-k8s.io/v1alpha4
kind: KubeadmConfigTemplate
metadata:
  name: km-wl-kubemark-md-0
  namespace: default
spec:
  template:
    spec:
      joinConfiguration:
        nodeRegistration:
          name: '{{ ds.meta_data.local_hostname }}'
```

## Cluster API / Docker / Kubemark architecture

With these two manifests you can piece together how a docker/kubemark cluster is
put together. You could even replace the docker cluster with a cluster on another
infrastructure provider. To help simplify the discussion a little, let's use
this diagram:

<img src="/img/capi-kubemark-arch.svg" class="img-responsive center-block" alt="Cluster API Kubemark Architecture">

On the host's docker, we use `kind` to create the CAPI Management Cluster which
is a container running the necessary kubernetes pieces. Next, we use the
`clusterctl` tool to create a new "docker provider" cluster for the Kubemark
Control Plane Cluster, which is another container. Lastly, we want to create
new nodes for the Kubemark Control Plane Cluster, kubemark requires that we create
these hollow nodes as pods running on a cluster that can join the control plane.
The Cluster API kubemark provider then creates pods within the CAPI Management
Cluster which then join the Kubemark Control Plane Cluster as nodes.

It's worthing noting that the kubemark nodes are also containers running on the
host docker, but that previous paragraph was getting quite convoluted!
You can use `kind` to get kubeconfig files for both clusters and inspect how they
look. Notice where the machines and nodes are, and what pods are running
on each cluster.

I hope this information helps or inspires you to try out Cluster API and play around
with this fun technology. Until next time, happy hacking =)

