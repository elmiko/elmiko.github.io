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

**NOTE** There is an issue currently being resolved with diskimage-builder when
creating CentOS images without the base element, for more information see
[bug 1308224](https://bugs.launchpad.net/diskimage-builder/+bug/1308224).

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

**Updates**

* 2014-04-25

Attaching the log files for the ambari-agent from the master node, and the
sahara log from the host machine. The file
`/var/log/ambari-agent/ambari-agent.out` was empty as was the
`/var/log/ambari-server` directory.

[ambari-agent.log](https://gist.github.com/elmiko/5702648769c6d025cc05)

[screen-sahara.log](https://gist.github.com/elmiko/3fe34fcd4e7b88415d25)

* 2014-05-01

Setting the proper floating ip configuration in Sahara allowed me to get past
the `Waiting` status. This involved ensuring that the following were set
`use_neutron=true`, `use_floating_ips=true`, and `use_namespaces=false`.

In the version of devstack I am using these are mostly preconfigured. In the
past I had been able to use the namespaces setting but apparently that is not
working from my devstack.

With these settings in place my cluster was able to move to the `Preparing`
status.

At this point I was able to ssh into the master node and run
`ambari-server setup` as root. I chose the default options with the exception
of the JDK. For that I chose the `Custom JDK` option and selected
`/opt/jdk1.6.0_31` directory. This allowed the ambari-server to finish setting
up.

Next I ssh'd to the worker nodes and updated
`/etc/ambari-agent/conf/ambari-agent.ini` to have the proper server address.
All the workers had `localhost` as their server addresses.

With both of these fixes in place the cluster started moving along once again.
It became stopped in the `Configuring` status.

Looking at the Sahara log files these is an exception happening with an
attempt to get a repo file from the public internet. Here is the full
exception stack:

    Traceback (most recent call last):
      File "/opt/stack/sahara/sahara/context.py", line 120, in _wrapper
        func(*args, **kwargs)
      File "/opt/stack/sahara/sahara/plugins/hdp/hadoopserver.py", line 41, in provision_ambari
        self.install_rpms()
      File "/opt/stack/sahara/sahara/plugins/hdp/saharautils.py", line 30, in call
        return func(self, *args, **newkwargs)
      File "/opt/stack/sahara/sahara/plugins/hdp/hadoopserver.py", line 58, in install_rpms
        r.execute_command(rpm_cmd, run_as_root=True)
      File "/opt/stack/sahara/sahara/utils/ssh_remote.py", line 367, in execute_command
        get_stderr, raise_when_error)
      File "/opt/stack/sahara/sahara/utils/ssh_remote.py", line 428, in _run_s
        return self._run_with_log(func, timeout, *args, **kwargs)
      File "/opt/stack/sahara/sahara/utils/ssh_remote.py", line 334, in _run_with_log
        return self._run(func, *args, **kwargs)
      File "/opt/stack/sahara/sahara/utils/ssh_remote.py", line 425, in _run
        return procutils.run_in_subprocess(self.proc, func, args, kwargs)
      File "/opt/stack/sahara/sahara/utils/procutils.py", line 52, in run_in_subprocess
        raise SubprocessException(result['exception'])
    SubprocessException: RemoteCommandException: Error during command execution: "curl -f -s -o /etc/yum.repos.d/ambari.repo http://s3.amazonaws.com/$
    Return code: 6

[screen-sahara.log](https://gist.github.com/elmiko/2bff463963252038d401)

[ambari-agent.log](https://gist.github.com/elmiko/a203792cdcc337bb2695)

[ambari-server.log](https://gist.github.com/elmiko/b34a526b76bd764f5b3d)
