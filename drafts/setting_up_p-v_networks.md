Configuring a P+V SDN Network for Use with Neutron
====

bsnlabs.bigswitch.com
demo accounts avail after show

upcoming activity in p+v area
perhaps entering into a new era of networking growth

3 general modes
mosh pit, everything in one big area
tidy, segmenting by type or category or some method
enterprise, some segmentation

segmentation, threat mitigation, traffic isolation, fault isolation

tools for segmentation
stateful firewalls
subnets/vlans/routes/acls
security groups
host ip tables

constraints
organization demarc points
surrounding l2/l3 design
provisioning automation ability

common case nova
tiered segregation
1vlan per project
using security groups to isolate tiers
l3 isolation of threats and faults
susceptible to l2 threats

security groups impractical to map end points other than pairs of openstack vms

low effort to get going, but beware "enterprise" issues over time

typical nova infra
nova server managing vlans
spine switch router(static config, all vlans)
leaf switch/routers(static config, all vlans)
vswitch/host ip tables for nodes

neutron
tier isolation at vlan subnet level
each project gets a logical routes with routes and acls
each tier get a v/s
l2/l2 isolation of threats and faults
simple to insert l3 services post deploy
maps to any kind of endpoint
higher effort to get going, but maps to "enterprise" practices over time

routers for each project
ml2-style systems:
specified compute nodes running os l3 agent
overlay/underlay systems(commercial):
distributed l3 agents enforced in the vswitch and overlay gateways vteps
unified p+v fabrics (commerical):
distributed l3 agent enforced in the vswitch and physical fabric

ml2 case
neutron server wi ml2 plugin
spine switch/router
dynamic vlan provis and prune
leaf switch/router
l3 agent
vswitch

overlay underlay
overlay controller
neutron server
spine switch
all vlans, static
leaf
static, all vlans
vswitch, no l3 agent

p+v
p+v controller, leaf and spine dynamic
no l3, vswitch

cloud fabric hardware and software
pick specific hardware "google switches"
new dell product, openswitches, choose the software
software side, sdn controller(provides neutron), switch o/s, vswitch
switch light, runs as either switch o/s or vswitch

bsn v+p cloud fabric
bs controller
neutron server
switch light on spine and leaf and vswitch

(hands on)


