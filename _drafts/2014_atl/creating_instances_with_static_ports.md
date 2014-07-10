Creating Instances with Static Ports
====

tunnel ranges
tunnel type
tenant network type

vlan needs physical or virtual equipment that support vlaning
gre allows encapsulating packet headers

config_ovs_neutron_bridge_mapping

gre does point to point tunnel, configured through ovs
vlan requires external, possibly physnet config

neutron net-show
provider:physical_network should be gre
this was accomplished by creating a network with neutron net-create
(packstack was configured to allow gre as the tunnel type)

creating a flavor
nova flavor-create

neutron port-create --no-security-groups --fixed-ip subnet_id=<name>,ip_address=<ip> --mac-address <mac> <port name>

glance image-create --name small --is-public True --disk-format qcow2 --container-format bare --copy-from <url>

glance image-list

get the port id, neutron port-list

starting an instance
nova boot --flavor <id> --nic port=<port id>


