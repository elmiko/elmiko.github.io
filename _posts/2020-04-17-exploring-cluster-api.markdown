---
layout: post
title: "Hacking on Kubernetes Cluster API with Fedora and Docker"
subtitle:  ""
date: 2020-04-17
categories:
---

The [Cluster API project](https://github.com/kubernetes-sigs/cluster-api) provides
declarative Kubernetes-style workflows for the creation and management of
entire Kubernetes clusters. I have recently starting to work more closely with
this project as part of $DAY_JOB, and as such I have been learning about how
to operate and test the machinery of Cluster API.

This is a very generalized view of the Cluster API architecture:

<img src="/img/cluster-api-arch.svg" class="img-responsive center-block" alt="Cluster API architecture">

A user communicates with a Kubernetes cluster, referred to here as "Management",
that contains the Cluster-API machinery. The user can request entire clusters
to be created by creating cluster resource objects associated with the cloud
providers they want to use. I won't go into the details here, but I highly
recommend looking at the [Cluster API book](https://cluster-api.sigs.k8s.io)
for more detailed information.

As you might imagine there are
[several providers available](https://github.com/kubernetes-sigs?q=cluster-api-provider&type=&language=).
The flexibility associated with these providers in combination with the
[Kind project](https://github.com/kubernetes-sigs/kind) created a perfect
storm to build a [Docker-based provider](https://github.com/kubernetes-sigs/cluster-api/tree/master/test/infrastructure/docker).
This provider is used by the project for automated testing and to help developers
get a quickstart with using Cluster API.

Naturally, the hacker in me wanted to get this working on my dev machines so I
could start messing with Cluster API. Also because I have been working on
the [Kubernetes Autoscaler project](https://github.com/kubernetes/autoscaler)
and I would like to start building some end-to-end tests for the Cluster API
Autoscaler provider.

I realize that was quite an intro, and I'm glad you have made it this far. Let's
get into the real heart of the story.

## Configuring my system for Docker

To begin with, I need to have Docker running my machine for the Cluster API
provider to work. Although Kind has support for Podman (the default container runtime
on Fedora), the Cluster API Docker provider does not yet support things outside
of Docker.

In order to install Docker on Fedora 31+ there are a couple steps that need to
be performed. One of the biggest changes that need to be made is disabling
the use of [cgroups](https://en.wikipedia.org/wiki/Cgroups) version 2. Docker
does not yet have support for cgroupsv2, I won't go into all the details about
this but if you are curious about it I highly recommend
[this article by Dan Walsh](https://www.redhat.com/sysadmin/fedora-31-control-group-v2).

Configuring Docker on Fedora takes a little prep work, instead of repeating all
those steps here I refer you to this document,
[How To Install Docker On Fedora 31](https://www.linuxuprising.com/2019/11/how-to-install-and-use-docker-on-fedora.html).

## Prerequisites for building and running Cluster API

I am the type of person who likes to build my tools from source, I know this
might sound surprising given that I'm using Fedora and not Gentoo, but, well...
Yeah, there it is. Anyways, for this effort I would like to build the Cluster API
project locally as well as a few tools that are needed for it, namely Kind and
Kustomize.

For most of these tools the only thing I need is the Go language tools. These
can be installed simply by adding `golang` from the package manager.

```
sudo dnf install -y golang
```

After that I just need to do a little setup for the Go pathing and whatnot,
it essentially boils down to this:

```
mkdir $HOME/go
export GOPATH=$HOME/go
```

Although I'm doing this temporarily in the shell for now, I usually add this
export to my `.profile`.

With Go in place and the pathing configured, I am now ready to download a few
tools and build them. In short order:

**Kind**
```
go get github.com/kubernetes-sigs/kind
```

**Kustomize**
```
go get github.com/kubernetes-sigs/kustomize
cd $GOPATH/src/github.com/kubernetes-sigs/kustomize
make
```

**Cluster API**
```
go get github.com/kubernetes-sigs/cluster-api
cd $GOPATH/src/sigs.k8s.io/cluster-api
make clusterctl
cp bin/clusterctl $GOPATH/bin/
```

At this point I have `kind`, `kustomize`, and `clusterctl` available in my
shell and I'm almost ready to start deploying a cluster.

## Configuring Cluster API

A couple more steps need to be done in order to configure the `clusterctl`
tool, and also the Docker provider.

First I create a `$HOME/.cluster-api/clusterctl.yaml` configuration file with the provider I want.

**clusterctl.yaml**
```
providers:
  - name: docker
    url: $HOME/.cluster-api/overrides/infrastructure-docker/latest/infrastructure-components.yaml
    type: InfrastructureProvider
```

**NOTE** I need to replace the `$HOME` here with my actual path as the `clusterctl`
tooling will require a full path.

I also need to make a few images that Cluster API will use. These are the images
that will contain the Cluster API bits that are needed for operation. The values
that are being used for `REGISTRY` are the tags that will be used in Docker. These
can be changed, but then I will need to note those changes for use later.

```
cd $GOPATH/src/sigs.k8s.io/cluster-api
make -C test/infrastructure/docker docker-build REGISTRY=gcr.io/k8s-staging-capi-docker
make -C test/infrastructure/docker generate-manifests REGISTRY=gcr.io/k8s-staging-capi-docker
```

While in the cluster-api project directory, I also need to run a command that
will create the necessary override files. To do that I need to create a file
and then run a command. First the file:

**clusterctl-settings.json**
```
{
  "providers": ["cluster-api","bootstrap-kubeadm","control-plane-kubeadm", "infrastructure-docker"],
  "provider_repos": []
}
```

and then the command:
```
./cmd/clusterctl/hack/local-overrides.py
```

Another thing I need to do is create a template for the clusters that will be
created. This file needs to be placed in `$HOME/.cluster-api/overrides/infrastructure-docker/v0.3.0/`.
I have used the template file that is used for testing and is found here:
[cluster-template.yaml](https://github.com/kubernetes-sigs/cluster-api/blob/v0.3.3/cmd/clusterctl/test/testdata/docker/v0.3.0/cluster-template.yaml).


```
mkdir -p $HOME/.cluster-api/overrides/infrastructure-docker/v0.3.0
cd $HOME/.cluster-api/overrides/infrastructure-docker/v0.3.0
wget https://raw.githubusercontent.com/kubernetes-sigs/cluster-api/master/cmd/clusterctl/test/testdata/docker/v0.3.0/cluster-template.yaml
```

(I realize your system might not have `wget`, but I hope you get the idea of what I'm doing)

The last preparation step I need is to create a manifest that will be used
for my Kind management cluster. I am using a file inspired by the one in the
[developer documentation for clusterctl](https://cluster-api.sigs.k8s.io/clusterctl/developers.html#additional-steps-in-order-to-use-the-docker-provider).
I create this in a file named `kind-cluster-with-extramounts.yaml`.

**kind-cluster-with-extramounts.yaml**
```
kind: Cluster
apiVersion: kind.sigs.k8s.io/v1alpha3
nodes:
  - role: control-plane
    extraMounts:
      - hostPath: /var/run/docker.sock
        containerPath: /var/run/docker.sock
```


## Deploying a Kubernetes cluster

Ok, finally ready for the good stuff(TM).

Create the management cluster
```
kind create cluster --config kind-cluster-with-extramounts.yaml --name clusterapi
```

Load the Cluster API container images into the management cluster
```
kind load docker-image gcr.io/k8s-staging-capi-docker/capd-manager-amd64:dev --name clusterapi
```

Initialize the Cluster API management cluster
```
clusterctl init --core cluster-api:v0.3.0 \
                --bootstrap kubeadm:v0.3.0 \
                --control-plane kubeadm:v0.3.0 \
                --infrastructure docker:v0.3.0
```

Set the environment variables needed by the Cluster API provider template. I
have taken these values from the network CIDRs for the virtual Docker network
(`172.17.0.0/16`) and the external network I use in my lab (`10.0.1.0/24`).
```
export DOCKER_POD_CIDRS=172.17.0.0/16 && \
export DOCKER_SERVICE_CIDRS=10.0.1.0/24 && \
export DOCKER_SERVICE_DOMAIN=cluster.local
```

Create the worker cluster manifest. This defines the cluster that will be
created by the Cluster API management cluster.
```
clusterctl config cluster work-cluster --kubernetes-version v1.17.2 > work-cluster.yaml
```

Launch the work cluster
```
kubectl apply -f work-cluster.yaml
```

Wait for the kubeconfig secret to be populated for the worker cluster, once it
is available I can proceed to the next step. I am looking for a secret named
`work-cluster-kubeconfig`.
```
kubectl --namespace default get secrets -w
```

Save the worker cluster kubeconfig so that I can easily use it for making
calls to the new cluster.
```
kubectl --namespace=default get secret/work-cluster-kubeconfig -o jsonpath={.data.value} \
  | base64 --decode \
  > ./work-cluster.kubeconfig
```

Deploy the Calico container network interface, this is needed by the worker
cluster to become active.
```
kubectl --kubeconfig=./work-cluster.kubeconfig \
  apply -f https://docs.projectcalico.org/v3.12/manifests/calico.yaml
```

Lastly, I watch the nodes in my new cluster to see them become active.
```
kubectl --kubeconfig work-cluster.kubeconfig get nodes -w
```

This may take a few minutes to get everything working, when it does your
output should show something like this:
```
NAME                          STATUS   ROLES    AGE     VERSION
work-cluster-controlplane-0   Ready    master   2m26s   v1.17.2
work-cluster-worker-0         Ready    <none>   109s    v1.17.2
```

## Useful monitoring and debugging commands

While you are waiting for things to become active, here are a few other commands
to help watch the cluster as well as some debugging.

### Watch cluster Machines become active

To see what is happening with the Machine resources in your management cluster, run this:
```
kubectl get machines
```

Output will look similar to this:
```
NAME             PROVIDERID                               PHASE
controlplane-0   docker:////work-cluster-controlplane-0   Running
worker-0                                                  Provisioning
```

I like to use this command as I watch the cluster become active and to debug
failing machines.

### Watch cluster nodes for readiness

To get the nodes from the worker cluster:
```
kubectl --kubeconfig work-cluster.kubeconfig get nodes
```

Output will look similar to this:
```
NAME                          STATUS   ROLES    AGE     VERSION
work-cluster-controlplane-0   Ready    master   7m58s   v1.17.2
```

I use this once I have established contact with the worker control plane, it
give good status about what is happening with the nodes that make up the cluster.

### Get logs for the Docker provider

This can be very helpful for debugging things that cannot be seen by kubectl
or when you cannot connect to ther worker.

First find the Docker provider pod:
```
kubectl get pods -n capd-system
```

In the output I look for the capd-controller-manager-* pod:
```
NAME                                       READY   STATUS    RESTARTS   AGE
capd-controller-manager-7f544b5ccd-68bcz   2/2     Running   0          17m
```

Then I use this pod name to tail the logs from the controller manager:
```
kubectl logs -n capd-system capd-controller-manager-7f544b5ccd-68bcz -c manager
```

## Wrap up

Well, if you've made it this far I sincerely hope you have a running cluster =)

It's a tough climb and there are plenty of pitfalls, but at this point if you
followed along you should be ready to run test workloads and even get into the
mechanics of the Cluster API project. If you are looking for more resources
about this project please checkout the following:

[Cluster API Book](https://cluster-api.sigs.k8s.io)

[Cluster API GitHub](https://github.com/kubernetes-sigs/cluster-api)

I hope it's been a good read, and at least nominally helpful. In the future
I will probably get into how to use the Autoscaler with this setup.

and as always happy hacking!
