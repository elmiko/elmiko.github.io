---
layout: post
title:  "Debugging notes from building CentOS Hadoop2 images"
date:   2014-04-24
categories: openstack sahara
---

This documents the process I have followed to create a Sahara cluster using
CentOS based Hadoop2 images.

Creating the Image
----

The images were created on a RHEL6 machine with SELinux disabled by changing
`/etc/selinx/config` to contain `SELINUX=disabled`. This machine
has access to the Optional channel as well as EPEL.

The trunk of sahara-image-elements was used for image creation. The last commit
of the repo used was `28a76fd0c0e7b5431c26728fe60185d79d65eff6`. The last
commit of the diskimage-builder repo used by sahara-image-elements was
`6b2a78f3abdcb7133ded96324f30907739f8f855`. I ran the following command to
create the image for testing:

    $ sudo diskimage-create.sh -p hdp -i centos -v 2 -d

I realize the `-i centos` isn't strictly needed, but I wanted to be thorough
when testing the image creation.

Loading the Image
----

I am using the tip of [Devstack](http://devstack.org) trunk, installed as per
the "Quick Start" instructions. This is the `local.conf` file I am using:

    [[local|localrc]]
    ADMIN_PASSWORD=openstack
    DATABASE_PASSWORD=$ADMIN_PASSWORD
    QPID_PASSWORD=$ADMIN_PASSWORD
    SERVICE_PASSWORD=$ADMIN_PASSWORD
    SERVICE_TOKEN=ca682f596-76f3-11e3-b3b2-e716f9080d50
    FIXED_RANGE=172.31.1.0/24
    NETWORK_GATEWAY=172.31.1.1
    DEST=/opt/stack
    LOGFILE=$DEST/logs/stack.sh.log
    SCREEN_LOGDIR=$DEST/logs/screen
    FLAT_INTERFACE=em1
    HOST_IP=10.0.1.63
    SWIFT_HASH=67a3d6b56c1f479c8b4e70ab5c2020f5
    SWIFT_REPLICAS=1
    RECLONE=yes
    disable_service rabbit
    enable_service qpid
    disable_service n-net
    enable_service q-svc
    enable_service q-agt
    enable_service q-dhcp
    enable_service q-l3
    enable_service q-meta
    enable_service neutron
    enable_service s-proxy s-object s-container s-account
    enable_service heat h-api h-api-cfn h-api-cw h-eng
    enable_service sahara
    enable_service sahara-dashboard

All of the following step were performed using the standard Horizon dashboard
interface in the `Demo` project. I have registered a newly created keypair
that was created with `$ ssh-keygen -t rsa`.

1. Create Images

    Imported using the `Create Image` button from the project's `Images` tab.
    QCOW2 format selected, no architecture, minimum disk, or minimum ram were
    entered.

2. Register Image

    Image registered using the `Register Image` button from the
    `Sahara > Image Registry` tab. The user name `ec2-user` was entered.

3. Create Node Group Templates

    Templates created using the `Create Template` button from the
    `Sahara > Node Group Templates` tab.

    For this cluster I have created 2 node group templates, a "master" node,
    and a "worker" node.

    Both nodes use the `m1.small` OpenStack flavor, ephemeral drive storage
    location, and the public floating ip pool.

    The master node processes selected were; `NAMENODE`, `SECONDAY_NAMENODE`,
    `ZOOKEEPER_SERVER`, `AMBARI_SERVER`, `PIG`, `HISTORYSERVER`,
    `RESOURCEMANAGER`, `NODEMANAGER`, `OOZIE_SERVER`, `GANGLIA_SERVER`, and
    `NAGIOS_SERVER`.

    The worker node processes selected were; `DATANODE`, `HDFS_CLIENT`, `PIG`,
    `MAPREDUCE2_CLIENT`, `NODEMANAGER`, and `OOZIE_CLIENT`.

4. Create Cluster Template

    Template created using the `Create Template` button from the
    `Sahara > Cluster Templates` tab.

    The template was created with 1 master node and 2 worker nodes.

5. Launching the Cluster

    From the `Sahara > Cluster Templates` tab, I used the `Launch Cluster`
    button from the freshly created template. I used the previously mentioned
    image as the base, the registered keypair, and the private network for
    management.

    At this point the cluster will stay in the `Spawning` status for a few
    minutes, moving into the `Waiting` state. In never seems to go past
    `Waiting`.

Debug Notes
----

I can log into the instances using ssh and the keypair, but only as root.
If I try to ssh in as ec2-user I get disconnected immediately. This is
resolved by setting SELinux to `Permissive` on the instance.

All the nodes produce the same errors at the end of boot:

    Starting ambari-server
    ERROR: Exiting with exit code 1. 
    REASON: Unable to detect a system user for Ambari Server.
    - If this is a new setup, then run the "ambari-server setup" command to create the user
    - If this is an upgrade of an existing setup, run the "ambari-server upgrade" command.
    Refer to the Ambari documentation for more information on setup and upgrade.
    Starting atd: [  OK  ]
    /etc/rc3.d/S95hadoop-mapreduce-historyserver: line 40: /usr/lib/bigtop-utils/bigtop-detect-javahome: No such file or directory
    Starting Hadoop historyserver:[  OK  ]
    Error: JAVA_HOME is not set and could not be found.
    /etc/rc3.d/S95hadoop-yarn-nodemanager: line 40: /usr/lib/bigtop-utils/bigtop-detect-javahome: No such file or directory
    Starting Hadoop nodemanager:[  OK  ]
    Error: JAVA_HOME is not set and could not be found.
    /etc/rc3.d/S95hadoop-yarn-proxyserver: line 40: /usr/lib/bigtop-utils/bigtop-detect-javahome: No such file or directory
    Starting Hadoop proxyserver:[  OK  ]
    Error: JAVA_HOME is not set and could not be found.
    /etc/rc3.d/S95hadoop-yarn-resourcemanager: line 40: /usr/lib/bigtop-utils/bigtop-detect-javahome: No such file or directory
    Starting Hadoop resourcemanager:[  OK  ]
    Error: JAVA_HOME is not set and could not be found.

[Full boot log for master node](https://gist.github.com/elmiko/31294ea3a36f4f25c445)

[Full boot log for worker node](https://gist.github.com/elmiko/bb7be3694a39fbdc083f)

The JAVA\_HOME error is being addressed in review
[89515](https://review.openstack.org/#/c/89515/).

The Ambari server error seems to be based around the fact that these instances
do not have access to the internet and the `ambari-server setup` command
seems to want to download a jdk image by default. If I run the setup from an
ssh shell I am able to select the jdk contained in `/opt/jdk1.6.0_31` and the
setup will complete.

The worker nodes appear to have an improper server hostname in their
`/etc/ambari-agent/conf/ambari-agent.ini`. They all contain `localhost` for
the server hostname, this may be due to the server not configuring properly
but, if the value is changed to the IP for the configured server then their
agents run properly.

Even with all the ambari processing running the cluster does not leave
`Waiting` status. There may be additional steps required to get the cluster
into a working state. This is still being investigated.

Updates to follow.
