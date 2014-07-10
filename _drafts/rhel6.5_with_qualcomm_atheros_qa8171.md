notes on fixing up rhel6.5 to work with atheros qa8171 ethernet
====

This was done on a machine with an ASRock H87M-ITX motherboard, based on it
coming up with no ethernet devices configured by the o/s.

`lspci` showed the ethernet device as a Qualcomm Atheros QA8171

1. get the kmod_alx rpm on the machine somehow...

found a mirror from http://elrepo.org/tiki/Download
ultimately used this rpm
kmod-alx-0.0-8.el6.elrepo.x86_64.rpm

2. install

sudo yum install -y kmod-alx-0.0-8.el6.elrepo.x86_64.rpm

at this point i rebooted and saw that the kernel had detected the driver by
running `dmesg | grep -i net`

3. fix up networking stuff

modified /etc/sysconfig/network to contain:
    NETWORKING=yes
    EOF

then rebooted and network was there.
