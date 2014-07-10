Linux Containers Next-Gen virtualization for the Cloud
====

lightweight virt provided by kernel
benefits
- near bare metal speeds
- performant ops times
- light weight, runtime, also packaging
  single app and deps in a contain

hypervisor-less

vm needs whole system, container only brings the necessary components
containers can use host libs/bins when appropriate

kernel
cgroups
namespaces
chroot
lsm

user
libs, pseudo fs, tools
lxc tooling, libvirt
commoditization (docker)
orchestration (geard, parallels, openstack)

conceptual container
high level checklist
processes
throttling/limits
prioritization
resource isolation
root file system
security

cgroups for limiting resources
device access
resources limits
prios
accounting
control
injection

*read kernel docs on cgroups*

pseudo-fs access through cgroups

checkout /sys/fs/cgroups
create taskfiles here for new groups
file ops on those subdirs to create new groups
pids into taskfiles to set access

tooling helps to automate the file ops into /sys/fs/cgroups

using namespace for resource isolation and control
mnt,pid,net,ipc,uts,user

pids will differ between inside the container and on host

within each named ns the standard groups area available
mnt,pid,net,ipc,uts,user

3.8 minimum kernel version for full support

pivot_root, more secure chroot

lsm, security modules
pluggable, configed by kernel
mac v dac
mac, admin assigns access controls to subject/initiator
mandatory
dac, resource owner assigns access controls to individual resources
discretionary

apparmor, selinux, grsec, some examples

linux capabilities

other security measures
bind mounts to restrict access
seccomp
keep the kernel fresh
user namespaces in 3.8+
- lauch contianer as non-root
- map uid/gid into container

extensive tooling

docker and libvirt-lxc in openstack
coreos
maestro
shipyard
fleet
atomic

spin time better than kvm
reboot time insanely better
snapshot slightly better than kvm

compute node metrics with dstat
performance seems much better using containers over kvm

memory consumption much lower with continaers

docker cpu usage is relatively low over time
kvm balloons as vms are increased

serial boot test perf for docker blows away kvm

network perf is very similar between docker/kvm

openbz

bare metal performance for containers

usage performance seems very similar between container and kvm

image sizes much smaller for containers

near bare metal perf
fast ops in cloud
reduced resource consump
out of the box smaller footprint

limits
lack of tooling
live migrate wip
fill orch
fears of securit
not well known
integration
not much standards
...

thoughts,
more work needs to be done kernel to help solidify the mechanisms used by
containers

ipsec and containers, could be sketchy
networking in general could be weird

http://www.slideshare.net/BodenRussell
