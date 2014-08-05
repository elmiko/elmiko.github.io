Nova-Network or Neutron for OpenStack Cloud?
====

slideshare.net/somikbehera

dissent comes from the stability presented by nova vs the flexibility of neutron

nova "empire"
----
single model
can do anything up to the flat network
monolithic model
in the early days nova compute held the networking agents
very limited in options
limited topologies supportedx
*single flat
akin to a single box router, using iptables to route all traffic
much broadcast traffic at l2 layer
*flat dhcp, like single flat but adding a dhcp server
programmable with mac-ip binding
*vlan dhcp, create multiple networks, reduce broadcast traffic in the flat
vlans more applicable in the physical model where machines are located near to
each other, with virtual networks the vlans can become very sparse physically
having to traverse many physnet to aggregate vlans(possibly)

flat is ok for single application types

no 3-tier apps

scaling
limited l2 range
dhcp&dns (dnsmask)
security (iptables on hypervisors)

limited network services
no self-tenant l3, no load balancer, no vpn

limited topologies
limited services
no integration with 3rd party, no framework for expansion
complex/limited ha and management/monitoring

everything must segregated per compute node to the physnet, with a compute
network node to control everything
projects grouped to compute nodes, which must be preconfigured for the physnet

the limitations in this model impact physical placement as well as the
complexity of virtual networks that can be created
trunking vlans

vlan code baked in to nova layer

neutron "rebels"
----
disparate opinions and choice
many more options or flexibility, this presents more challenges

provides choice to provider and tenant side of the network stack

toplogies
l3 self tenant provisioning
security for ingress and egress rules
LBaaS
VPNaaS (coming)
single tenant network can map to multiple vlans within each tenant (3 tier)

pluggable framework to swap pieces of the network depending on needs
neutron team is validating many common topologies, very difficult to test
everything as combinations are vast

overlays
vlan limits are removed with gre tunnels, this helps decouple the vm topology
from the physnet topology

open to 3rd party choices
nsx, linuxbridge, oca, ucs, ryu

neutron-ovs-plugin, talk to ovs to build tunnels and shape traffic
neutron-dhcp-agent, sets up dnsmasq in a namespace per configured net/subnet
with mac/ip combos
neutron-l3-agent set up iptables/routing/nat as directed by ovs plugin

in more cases gre overlay tunnels are used for topology, but flat and vlan
are also supported

br-ex > routing > l3 agent
routing > br-int > dnsmasq > dhcp agent
br-tun/int > ovsdb/ovsvsd > ovs agent


comparisons
----

neutron deploys growing
migrating from nova to neutron is difficult currently
ovs is main backend for neutron, almost 2:1 over linuxbridge
ovs only backend with gre


notes
----

linuxbridge has feature parity with ovs
linuxbridge simpler?

labs.hol.vmware.com (search for OpenStack or HOL-SDC-1320)

https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/recap-nova-network-or-neutron-for-openstack-networking
