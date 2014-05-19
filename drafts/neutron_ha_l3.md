high availibility with neutron l3 agent
====

currently,
losing an l3 agent could me a vm losing connection

new scheduler for l3 agent
adding new virtual routers where available

multiple external nets on an l3 agent

even with this, no ha

enovance has a healthcheck service
oss, works on grizzly, havanna, and icehouse

healthcheck is distributed
can remove nodes if isolated

healthcheck allows failover to another l3 agent
not full ha
not stateful
downtime can be long
not part of neutron

2 approaches to solve this problem, router scheduling
VRRP
no api change
xtra config
works within tenant networks
works on external nets
does not break FWaas VPNaas LBaas
neutron server
- ha l3 sched
- virt router id attr
- special network for VRRP traffic
l3 agent
- new keepalive interface manager, IPs as VIP
- optional Contrackd support

implementation
l3 agents communicate
keepalived, conntrackd provide integration for VIP traffic

limits
- 256 virt routers per HA network
- can be removed by allowing more that 1 HA net for tenant

second approach
distributed v-routers
- distribute router on compute
- no l3 agent can bottleneck

dvr allows for traffic between nodes in different nets but same compute node to
communicate without having to hit an external l3 agent

dvr can work with vrrp


related stuffs
http://techs.enovance.com/6413/summit-openstack-neutron-point-of-view
https://blueprints.launchpad.net/neutron/+spec/l3-high-availability
