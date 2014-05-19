neutron opensource backends
====

plugins
* ML2 Modular
* Standalone

neutron builtin
l2/l3
implemented by ML2 w/OVS
OVS l2
l3 agent + dhcp
service plugins, loadbalancing, vpn, etc

rest api to neutron server
ML2/L3 plugins connect to AMQP
AMQP talk to all agents

builtin limits
scalability limits of the L2 agent
limit of the L3 agents only if the OSS backends have viable alterniatives
developers are not necesarily net experts, broad mix

L2Population ML2 Driver
pre-populated forwarding tables of both OVS and LinuxBridge

proxy arp to help direct routing

https://wiki.openstack.org/wiki/L2population

OpenContrail
cloud networking
network function virtu
controller/vrouter
opencontrail.org

opencontrail nodes managed by compute, they configure new vms networking

github.com/dsetia/devstack
pedromarques.wordpress.com/2013/11/14/using-devstack-plus-opencontrail

OpenDaylight
opendaylight.org
IaaS orchestration is an important use case
is part of openstack neutron NL2 MechanismDriver in Icehouse
currently requires DHCP and L3 agents
compute node controls opendaylight node
neutron instructs odl node, network node as well

Ryu Network OS
osrg.github.io/ryu
supports OpenFlow
ofagent NL2MechanismDriver, and a standalone plugin
multi-tenant
MAC, VLAN, GRE
support port binding, ryu agent or ofagent must be run on host
compute controls ryu node, neutron talks to ryu, and a network node
github.com/osrg/ryu/wiki/OFAgent-Openstack-IceHouse-environment-HOWTO



