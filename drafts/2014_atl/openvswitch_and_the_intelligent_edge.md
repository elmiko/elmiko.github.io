Open vSwitch and the Intelligent Edge
====

referring to the hypervisor as the edge

in the goldilocks zone
has greater context than in-network devices

reduced risk of attack than an agent running in the guest

can enforce rules and have a different view point

able to infer state by observing, or probing state with introspection

mapping logical to physical

can modify behavior
- enforce policy ingress/egress
- modify bits in the inner or outer packet
- tcp pacing (changing the way packets are distributed from the nic)
- tcp de-synchronization (can happen bsaed on buffer fills)
- flowlets

inferring state
can see every packet and knows local source
- learn mac and ip on first use
- igmp and dhcp snooping
- which pairs are comunicating
- flow characteristics

guest introspection
an agent in the vm communicates with a daemon inthe hypervisor
types of data
- users
- identity for in/out bound connections
- identity of processes
- data transfer rates
- socket queue depth
- system characteristics

applications for greater state
qos
load-balancing
selecting traffic to be sent to middlebox (NFV)
better firewalls
elephant flow detection

implementing a firewall
2 ways
match on tcp flags
- pro: fast
- con: allows non-established flow through with ack or rst set, only TCP
use "learn" action to setup new flow in reverse direction
- pro: more "correct"
- con: forces every new flow to ovs userspace, reducing flow setup by orders of magnitude
neither support "related" flows or tcp window enforcement

connection tracking
adding this ability to ovs
leveragin the contract model
stateful tracking of flows
supports algs to punch holes for related "data" channels
- ftp
- tftp
- sip
implement a distributed firewall with enforcement at the edge
- better perf
- better visibility
introduce new openflow extensions
- action to send to conntrack
- match fields on state of connection
have a prototype working, expect to ship as part of ovs by year end

guest introspection + connection tracking
possible to implement an advanced firewall
- know precisely what user generated traffic
- know what application is generating traffic

elephant flows
elephants vs mice
mice short lived flows
elephants love-lived packets
mice tend to be bursty and latency-sensitive
elephants tend to transfer large amount of data and less concerned about latency
elephants can fill up a network, this introduces latency for mice
at the edge we are able to detect the underlay based on the overlay

detection and action
multiple mechanisms for detect
- rate and time
- large segments (tcp)
- guest introspection
multiple mechanisms for action
- put mice and elephants in different queus
- route ele diff than mice
- send ele along a separate physnet
- intelligent underlay

handling elephants in nsx
ovs is at an optimal location at the edge
has flow-level view
knows mapping between logical and phys
detection and action occur separately, can evolve independently
supported detection mechanisms
- rate and time
- lrage segments
supported actions
- mark dscp
- underlay agent?

dscp marking
marks the outer ip header
switched configed to handle different marks
they are working on an internet draft

significant performance improvements for mice when detecting elephants and
routing properly

ovs ele poc arch
in kernel
supports thresh and tso
proof of concept at this point

networkheresy.com/2013/11/01/of-mice-and-elephants/
blogs.vmware.com

http://blogs.vmware.com/networkvirtualization/2014/02/elephant-flow-mitigation.html

