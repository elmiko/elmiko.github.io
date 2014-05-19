setup with packstack
(appears to be on rhel machines)

chkconfig --list | grep neutron
to see what is running

service neutron-openvswitch-agent status

grep core /etc/neutron/neutron.conf
demo is using ovs
neutron.plugins.openvswitch.ovs_neutron_pliugin.OVSNeutronPluginV2

/etc/neutron/plugin.ini
network_vlan_ranges
integration_bridge
tunnel_bridge

neutron agent-list
neutron agent-show
*note the tunnel type on the ovs agent*

neutron agent-update --admin-state-up=false
turn off admin on ovs


