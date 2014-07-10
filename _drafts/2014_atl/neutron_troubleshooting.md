Troubleshooting Neutron Networks
====

define the problem
examine the situation
consider the causes
consider the solutions
act and test
review troubleshooting

consider these forward and backwards to fully understand

be cogniscent of changing things while troubleshooting

#openstack-neutron
ask around

neutron traffic flow compute node

using iptables in the l2 agent portion to help keep security high(i think?)

compute node
vm1 > tap > tap > linux bridge > veth
to l2 agent
veth > ovs > ovs
to phys net

neutron traffic flow network node
phys net up to l2 agent
l2 agent configs 2 ovs bridges
int bridge talks to dhcp for addresses
l3 agent configs between the l2 stuff and another internal bridge to provide
phys netting to nodes(?)

no more ifconfig, use **ip**
ifconfig, route, netstat are all deprecated

iptables useful commands, -n --v --line-numbers

also useful
ping, host, traceroute, tcpdump, ip neighbor, arp, arping

wireshark

to troubleshoot well, understand packet travel in the kernel
know when routes go stale

ovs-vsctl
- show - overview of ovs config
- add-br - add bridge
ovs-ofctl
- dump-flows <br> - examine flow tables
- dump-ports <br> - port statistics by port number
- show <br> - port number to port name mapping
ovs-appctl
- bridge/dump-flows <br> - examine flow tables
- fdb/show <br> - lists mac/vlan pairs learned

* use port mirroring to see traffic processed by a port
can be used to connect ports and watch what is happening by running tcpdump on
the connected port

br-tun flow tables
table 1 from vm (?)
table 2 from outside (?)
table 21 broadcast
table 20 unicast
table 10 inserts return path rules into table 20

p link add type veth
ip link set veth0 up

ovcs-vsctl add-port br-int "veth0"
ovs-vsctl -- set Bridge br-int mirrors=@m
(missed the end of commands...)

neutron-debug command
probe-clear
probe-create
probde-delete
probe-exec
probe-list
ping-all

troubleshooting
* gather data
mac and ip of vms, dhcp server, router
mac and ip of data network nodes
set the neutron services to lg at debug level
* where is the prblem located
1 tenant or all
1 network or all
what protos
l2 or l3 problem
* examine/locate
look carefully at what is happening *pay attention*
isolate to tenant, network, vm, compute or network nodeset
* consider causes
* need more data?
* consider solutions
* test - 1 thing at a time

keep a log!

network monitoring
traffic levels
- add sflow to ovs
- watch for failes
- blackhat behaviors

udhcp to send requests
tcpdump -e -n -i <int>

watch "ovs-ofctl dump-flows <bridge>"
watch "ovs-ofctl dump-flows br-tun"


ip netns exec <ns> ip a
ip netns exec <ns> tcpdump -e -n -l -i <int>
dont forget -l

