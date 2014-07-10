OpenStack Python and the Holy Grail: A New Proposal for "Image Portability"
====

deployment strategies
----
portability or bootstrap ability?

Bake?
build image, test it, snapshot, stamp many copies

identical clones
work well with boot from volume
downloading from glance slows this process down

Bootstrap?
minimal os image
config mgmt to continue the install

which is best?
bootstrap quick build, but all software must be downloaded and configed
bake slow download of image, quick boot/buildup


cloud server features
----
performance servers
bootstrappers
-ssh keys
-cloud-init
-devops automation
portability
-image import

bootstrapper allows for more collaboration as differences can be contained in
shared configs

baked could be more portable as everything is self-contained

inter-op
----
what is the best route?

what are the needs of the users?
move between clouds
move from dev box to cloud
...

moving data
be careful, data is vulnerable and can be big
install should be easy

use glance or swift to contain the data
allow images to access the data, downloading when needed

image portability?
challenges
p to v, what tools to use?
hypervisor drivers, kernel versions?
networking settings and agents, configs and routing?
packaging, mirrors, what is available?
how much is all this needed if the data is available?

common bootstrapping?
install on cloud image like a dev machine
cloud-init with git backed repos for installation
dependency resolution
network configs
infrastructure become a "programmable" service of the images

Back to the Future...
----
common bootstrapping between services, private/public
data from swift/glance

minimize image install size
make the app specific data easy to access via swift/glance


things to think about
----
how to make images portable
bootstrapping could make images more portable via minimal installs
config sources and data contained in swift/glance on the stack

small image size makes the initial bootup faster, hopefully simpler
data availibility is increased by making everything accesable on the stack
eliminating the need for external access

need for a good api between the thing inside the image that responds to what
openstack provides, and the external resources that are provided

configdrive

standardize the interface between these components

how to customize on boot, need to know what you are talking to
knowledge of the interface to the image
differences between image types

