---
layout: post
title: "Adding hostVolume persistent volumes to my okd 3.11 install"
subtitle:  ""
date: 2019-11-21
categories:
---

In my [last article](https://notes.elmiko.dev/2019/11/14/okd-311-dev-machine.html)
I talked about how to setup an okd 3.11 all-in-one installation. The install
that results from those instructions is quite bare. Something that I've had to
do for various applications I want to run, is to create
[peristent storage](https://docs.okd.io/3.11/architecture/additional_concepts/storage.html).

In Kubernetes, the main way to interact with persisten storage is through the
[PersistentVolume](https://docs.okd.io/3.11/rest_api/api/v1.PersistentVolume.html)
and [PersistentVolumeClaim](https://docs.okd.io/3.11/rest_api/api/v1.PersistentVolumeClaim.html)
objects.

In a full cloud-based deployment storage can be a very nebulous thing from a
user perspective. It's there, and it's backed by some drives _somewhere_. This
isn't quite good enough for my local development machine, I need to be able to
debug applications that use persistent storage. To that end, there is a great
backend called `hostVolume` which allows mapping a local volume on the host
to a PersistentVolume in Kubernetes. This is perfect for my single machine deploy.

## Adding a local hostVolume

To begin, i need to create the directories that will be the individual volumes.

```
sudo mkdir -p /mnt/openshift-pv/pv1 /mnt/openshift-pv/pv2 \
              /mnt/openshift-pv/pv3 /mnt/openshift-pv/pv4 \
              /mnt/openshift-pv/pv5
```

Next I allow group write into these folders to ensure that my workloads will
be able to actually write stuff.

```
sudo chmod g+w -R /mnt/openshift-pv
```

And lastly I need to adjust the SELinux security context so that the kernel
will allow containers to use these directories.

```
sudo chcon -R unconfined_u:object_r:svirt_sandbox_file_t:s0 /mnt/openshift-pv
```

With these commands the host is now ready to accept the linkage to Kubernetes
for the PersistentVolumes. To enable this on Kubernetes I need to apply the
appropriate object definitions to the API server.

**shift.opb.studios-pv.yaml**
```
kind: List
apiVersion: v1
metadata: {}

items:
  - apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: pv1
    spec:
      capacity:
        storage: 10Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeClaim: Retain
      hostPath:
        path: /mnt/openshift-pv/pv1
  - apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: pv2
    spec:
      capacity:
        storage: 10Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeClaim: Retain
      hostPath:
        path: /mnt/openshift-pv/pv2
  - apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: pv3
    spec:
      capacity:
        storage: 10Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeClaim: Retain
      hostPath:
        path: /mnt/openshift-pv/pv3
  - apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: pv4
    spec:
      capacity:
        storage: 10Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeClaim: Retain
      hostPath:
        path: /mnt/openshift-pv/pv4
  - apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: pv5
    spec:
      capacity:
        storage: 10Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeClaim: Retain
      hostPath:
        path: /mnt/openshift-pv/pv5
```

I apply this manifest

```
oc apply -f shift.opb.studios-pv.yaml
```

and then verify that the PersistentVolumes have been created

```
$ oc get pv
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv1    10Gi       RWO            Retain           Available                                   1m
pv2    10Gi       RWO            Retain           Available                                   1m
pv3    10Gi       RWO            Retain           Available                                   1m
pv4    10Gi       RWO            Retain           Available                                   1m
pv5    10Gi       RWO            Retain           Available                                   1m
```

Excellent! I can know create objects that require PersistentVolumeClaims.

*update*
Something to keep in mind about these insttructions is that the reclaim policy
of `Retain` will prevent these volume claims from being released when they are
not being used. If this behavior is causing you problems, try using the `Recycle`
policy instead.

I hope these instructions are helpful, and as always happy hacking =)
