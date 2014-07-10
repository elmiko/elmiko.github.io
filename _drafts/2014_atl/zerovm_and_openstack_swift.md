ZeroVM and OpenStack Swift
====

ZeroVM
rackspace big core contributor

creates secure isolated execution envs for arbitrary code
single app or other

can be embedded in storage systems

based on NaCl
uses ZeroMQ for messaging
includes a full compiler toolchain
ZRT provides a subset of POSIX API
ZRT also included a port of CPython
ZerovmRunTime

a computing platform
core principles
- small light fast (bootable in under 5ms)
- secure (based on google nacl stuff)
- hyper-elastic (can use 100,000s of machine for very short tasks)
- embeddable (can put in multitenant storage systems)
- functional (deterministic) (for any set of inputs, the output is guaranteed)
- oss ( APL2.0, github, zerovm.org)

differences from vms and containres
no kernel/os
very low overhead (lower than containers)
security on par with vms
startup as fast as containers

single execution env

instead of pulling data, users can push data to apps

horizontal scaleability based on the idea that devs are contained to the
zerovm env

app/data bundles are easy to distribute

zero-cloud middleware gets installed on swift proxies and the storage nodes

Zwift middleware, in proxy server, object server
object server has an executor pushing to zerovm
zerovm talks to reader in proxy server

apps can be stored and pre-validated in a swift object

zebra.zerovm.org
test env

wordcount demo, written in python
1 py for map, 1 py for reduce
json file for job description, instructs the zerovm middleware
json has paths into swift for data input and output

dynamic watermark insertion using zerovm
this happens on each image open from the browser
passing arguments in from url to control parameters in the zerovm app

future possibilities
enhanced object storage options
converge compute and storage big data platform
solutions targeted at specifc verticals
dynamic content creation at the edge

possible porting tools from hadoop into the zvm framework
entertainment related, rendering, post-production
scientific python

zerovm.org
github.com/zerovm
freenode #zerovm

job scheduler is currently "naive", random pic if replicas occurring
better scheduler in the future
default action on replicas is to process multiples on multiple writes to swift

currently limited compiled python components inside zvm

data security based on nacl stuff, keeping data contained to individual zvm
instances
data comes in as read only, original data is preserved

zvm toolchain restricts certain opcodes to improve security
run-time validation against binaries coming into the system

currently not processing data on injest, perhaps future improv.
very flexible in terms of data selection, anything from swift
objects can be grepd, listed, etc.

challenges for portability
language support not complete yet


