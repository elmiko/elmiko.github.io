---
layout: post
title: "Hacking on the OpenShift Cluster Autoscaler"
subtitle:  ""
date: 2020-10-22
categories:
---

Something that I need to do with an ever increasing frequency is changing the
way that the [cluster autoscaler](https://github.com/openshift/kubernetes-autoscaler)
behaves on a running OpenShift cluster. While this operation can be sensitive
(I don't want to blow up my cluster!), there are some simple steps to take
that allow me to adjust the logging output and even the commands which are
passed to the autoscaler.

## Getting Started

Before I can start messing with the deployments for various components I will
need to scale down the Cluster Version Operator. For more information about
why I'm doing this, see my previous post
[Tips for Experimenting with the OpenShift Machine API](https://notes.elmiko.dev/2020/08/18/tips-experimenting-mapi.html).

**Scaling down the cluster version operator**
```
oc scale --replicas=0 deploy/cluster-version-operator -n openshift-cluster-version
```

Additionally, I need to scale down the deployment for the
[Cluster Autoscaler Operator](https://github.com/openshift/cluster-autoscaler-operator)
to ensure that it doesn't try to _correct_ the changes I am introducing.

**Scaling down the cluster autoscaler operator**
```
oc scale --replicas=0 deploy/cluster-autoscaler-operator -n openshift-machine-api
```

I also need to make sure that there are no autoscalers currently running.

**Delete ClusterAutoscaler resource**
```
oc delete ClusterAutoscaler default
```

## Changing the Autoscaler

There are a couple tasks that I perform most commonly when hacking on the
autoscaler: adjusting the log verbosity, and injecting extra command line parameters.
Both of these can be controlled by adding environment variables to the deployment
for the Cluster Autoscaler Operator (CAO).

With the CAO scaled down, I can edit its deployment to add a few values.

**Edit the cluster autoscaler operator deployment**
```
oc edit deploy/cluster-autoscaler-operator -n openshift-machine-api
```

I look in the `Deployment.spec.template.spec` field to find the details for the
container named `cluster-autoscaler-operator`. This container has several
environment variables specified. It should look something like this:

**cluster-autoscaler-operator deployment, environment variables**
```
env:
- name: RELEASE_VERSION
  value: "0.0.1-snapshot"
- name: WATCH_NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: CLUSTER_AUTOSCALER_NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: LEADER_ELECTION_NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: CLUSTER_AUTOSCALER_IMAGE
  value: docker.io/openshift/origin-cluster-autoscaler:v4.0
- name: WEBHOOKS_CERT_DIR
  value: /etc/cluster-autoscaler-operator/tls
- name: WEBHOOKS_PORT
  value: "8443"
- name: METRICS_PORT
  value: "9191"
```

I want to add 2 values to this list to add my changes:

**Add verbosity and extra args to cluster-autoscaler deployments**
```
- name: CLUSTER_AUTOSCALER_VERBOSITY
  value: "4"
- name: CLUSTER_AUTOSCALER_EXTRA_ARGS
  value: "--new-pod-scale-up-delay=10m"
```

In this example I am setting the verbosity to "4" (the maximum), and adding
the command line argument "--new-pod-scale-up-delay=10m" to each deployment
of the cluster autoscaler.

It's worth noting that these changes affect the **cluster autoscalers** that
are deployed by the CAO. These values will affect **any** autoscalers that I
create with the `ClusterAutoscaler` resource as described in the
[OpenShift documentation](https://docs.okd.io/latest/machine_management/applying-autoscaling.html).

## Using the new options

Before I can see my new changes I will need to scale back up the CAO and then
create a cluster autoscaler.

**Scaling up the cluster autoscaler operator**
```
oc scale --replicas=1 deploy/cluster-autoscaler-operator -n openshift-machine-api
```

I now need to create a cluster autoscaler. To test my changes I can use the
a very basic ClusterAutoscaler:

```
---
apiVersion: "autoscaling.openshift.io/v1"
kind: "ClusterAutoscaler"
metadata:
  name: "default"
spec:
  balanceSimilarNodeGroups: true
  ignoreDaemonsetsUtilization: false
  skipNodesWithLocalStorage: true
  podPriorityThreshold: -10
  resourceLimits:
    maxNodesTotal: 24
    cores:
      min: 8
      max: 128
    memory:
      min: 4
      max: 256
  scaleDown:
    enabled: true
    delayAfterAdd: 10s
    delayAfterDelete: 10s
    delayAfterFailure: 10s
```

## Verifying the changes

To truly verify what I have done I will need to inspect the log output from
the cluster autoscaler. To do this I need to find the pod deployment for
the autoscaler and then follow its logs.

**Find the cluster autoscaler**
```
$ oc get pods -n openshift-machine-api
NAME                                           READY   STATUS    RESTARTS   AGE
cluster-autoscaler-default-58bb9c9f6d-s7nkl    1/1     Running   0          9s
cluster-autoscaler-operator-759c6456cd-jnpcc   2/2     Running   0          2m50s
machine-api-controllers-7dc56dc5f6-8vprl       7/7     Running   0          3h29m
machine-api-operator-5dcb4496c4-wddp4          2/2     Running   0          3h30m
```

The cluster autoscaler will always be named "default", so in the example above
I want to get the logs for `cluster-autoscaler-default-58bb9c9f6d-s7nkl`.

**Getting the logs for the cluster autoscaler**
```
oc logs -f cluster-autoscaler-default-58bb9c9f6d-s7nkl -n openshift-machine-api
```

At this point I can confirm that my command line argument was added and that
the log verbosity is set how I want.

Hopefully these instructions have helped you get a start with the debugging
options available in the cluster autoscaler. Good luck with your experiments
and as always, happy hacking =)
