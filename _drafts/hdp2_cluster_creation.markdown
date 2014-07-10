Creating an HDP2 cluster in OpenStack
====

sahara config
----

make sure that neutron is on and floating ips
*update*
try with use_floating_ip=false
use_neutron=true
use_namespaces=true

horizon config
----

local_settings.py
add 
SAHARA_URL
SAHARA_USE_NEUTRON
AUTO_ASSIGNMENT_ENABLED


worker node group template
----

datanode
hdfs\_client
pig
mapreduce2\_client
nodemanager
oozie\_client


master node group template
----

namenode
seconday\_namenode
zookeeper\_server
ambari\_server
pig
historyserver
resourcemanager
nodemanager
oozie\_server
ganglia\_server
nagios\_server

networking notes
----

to make the host node communicate with the instances, reassign eth0 to the
br-ex device

    ifconfig eth0 0
    ifconfig br-ex <ip>
    ovs-vsctl add-port br-ex eth0

to make this permanent see
http://openstack.redhat.com/Neutron_with_existing_external_network

at this point the instances can see the internet but have no knowledge of dns

starting up
----

had to manually run `ambari-server setup` on master and give it a route to the
internet, as well as dns

had to configure the server ip in `/etc/ambari-agent/conf/ambari-agent.ini` on
the workers as they were set to localhost
