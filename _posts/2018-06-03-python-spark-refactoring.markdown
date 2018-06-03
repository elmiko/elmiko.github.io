---
layout: post
title: "Another reason to use Apache Spark's structured streaming interface with Python applications"
date: 2018-06-03
categories:
---

_Special shoutout to [Will Benton](https://chapeau.freevariable.com/) and
[Erik Erlandson](https://erikerlandson.github.io/), their advice and knowledge
of Spark's internals helped me to fully grok these concepts.
Check their stuff out!_

Recently I have been doing some refactoring of the
[Spark](https://spark.apache.org)/[Kafka](https://kafka.apache.org) applications
in the [bones-brigade project](https://github.com/bones-brigade). I started
this project as a place to collect several application framework skeletons
that I seem to be continually recreating while working on
[OpenShift](https://www.openshift.org) and other container-based platforms.
I wanted to ensure that the codebases were staying fresh and providing a
solid foundation for useful construction, and to that end, I've been re-examining
the state of the streaming applications because they were never truly in
alignment across the Java/Python language divide.

This all started with a mis-step on my part. When I originally created the
[Java version](https://github.com/bones-brigade/kafka-spark-openshift-java)
of the Spark/Kafka application, I only had it reading from a Kafka topic and
then printing out the messages it received. The
[Python version](https://github.com/bones-brigade/kafka-spark-openshift-python)
however, was doing something more useful; reading from a topic and then
writing back to a second topic.

The reason I find the second version of this application more useful, namely
reading then writing, is that it more closely approximates a style of
software design known colloquially as a
[kappa architecture](http://milinda.pathirage.org/kappa-architecture.com/)
(as opposed to
 [lambda architectures](https://en.wikipedia.org/wiki/Lambda_architecture)).
I'm not going to dive into why I prefer this design other than to say that I
find it makes building pipelines of processing applications simpler than
having to deal with a database or other disk-like persistance store.
_(yes, I realize there is much to nitpick in that last statement, but bear
with me here)_

So, in general what I want my application skeletons to do is something like
this:

<img src="/img/kappa-spark-1.svg" class="img-responsive">

Where the Spark component reads from `Topic1`, does some processing, then
writes to `Topic2`. In the skeletons there is no actual processing happening,
just a convenient placeholder to drop code.

### A tale of distributed computing

Something that had been bugging me for awhile, and that had become more prominent
as I refactored the Java version, was that the Python version of this code used
Spark's `collect` method to gather all the messages in an
[RDD](https://spark.apache.org/docs/latest/rdd-programming-guide.html#resilient-distributed-datasets-rdds)
before rebroadcasting them to the second Kafka topic.

The [API documentation for the `collect` method](https://spark.apache.org/docs/latest/api/python/pyspark.html#pyspark.RDD.collect)
says:

> Return a list that contains all of the elements in this RDD.

Ok, that sounds good, but there is a caveat:

> Note: This method should only be used if the resulting array is expected to be small, as all the data is loaded into the driver’s memory.

What this means is that every RDD is transmitted back to the driver application,
and in the case of my original code this made it easy to retransmit the
messages. But it also meant that there could be extra network trips for any
processing that was done as the driver would need to have all the results, it
would be far more efficient if the executors could send the messages to Kafka
directly.

The
[first version](https://github.com/bones-brigade/kafka-spark-openshift-python/blob/b6714c19f607e18b80903a3fec51e263c173048f/app.py#L64)
of the code looked like this:

```python
def send_response(rdd):
    """A function to publish an RDD to a Kafka topic"""
    producer = kafka.KafkaProducer(bootstrap_servers=self.servers)
    for r in rdd.collect():
        try:
            record = r.encode('ascii', 'backslashreplace')
            producer.send(self.output_topic, record)
        except Exception as e:
            print('Error sending collected RDD')
            print('Original exception: {}'.format(e))
    producer.flush()

messages = self.kafka_stream.map(lambda m: m[1])
messages.foreachRDD(send_response)
```

I wanted to remove that pesky `collect` and I ended up with a piece of
trimmed code that looked, more or less, like this:

```python
def send_response(r):
    """A function to publish an RDD to a Kafka topic"""
    producer = kafka.KafkaProducer(bootstrap_servers=r.get('servers'))
    try:
        record = r.get('message').encode('ascii', 'backslashreplace')
        producer.send(r.get('topic'), record)
    except Exception as e:
        print('Error sending collected RDD')
        print('Original exception: {}'.format(e))
    producer.flush()

messages.foreachRDD(lambda r: r.foreach(send_response))
```

This certainly looks cleaner and now the driver no longer needs to bring
all the information back before sending it out. _But_, this tradeoff
introduces a new issue: all the executors will need access to the `kafka`
package in order to make a `KafkaProducer`. What this means in my little
cloud-orchestrated playground is that I will need to somehow get the
Python Kafka package to all my executor images. Which would require me
using some [new features in the oshinko-s2i project](https://github.com/radanalyticsio/oshinko-s2i/commit/71e9d237c5c1ea75f6f5e4dec9900ad3ea6f1448) or rebuilding my executor image to contain the
dependency.

### A wild solution appears!

As I was considering how to proceed, I kept thinking about the
[structured streaming interface](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html)
in Spark and specifically how it made doing these type of interactions _really_
easy. As I started to sketch out how the new code might look with structured
streaming, another light bulb went off for me; I could leverage the standard
`--packages` argument to `spark-submit` to gain access to the Kafka connector.
This means that I can use a standard Spark interface to distribute the
dependencies for me, no need to inject extra Python packages \o/

The code also became much simpler, allowing me to remove some of the scaffolding
which was necessary for creating the distributed stream interface. The new
code now looks like this:

```python
records = (
    spark
    .readStream
    .format('kafka')
    .option('kafka.bootstrap.servers', args.brokers)
    .option('subscribe', args.intopic)
    .load()
    .select(
        functions.column('value').cast(types.StringType()).alias('value'))
)

writer = (
    records
    .writeStream
    .format('kafka')
    .option('kafka.bootstrap.servers', args.brokers)
    .option('topic', args.outtopic)
    .option('checkpointLocation', '/tmp')
    .start()
)
```

This looks quite different from the previous version, but I think it makes
the code easier to read. Additionally, the skeleton now gives easy access to
the powerful structured streaming operations available in Spark.

### Bottom line: structured streaming is way cool

Confession time. At heart I love a good low-level implementation of _anything_ XD

I started my programming obsession as a youth doing assembly language and
continued that into a career of C and embedded software and systems design. To
this day I am fascinated by low-level approaches and set my learning bar
accordingly, and although I originally started these applications with the
intent of using the low-level RDD interface for distributed streams,
it became clear over time that all the advice my colleagues kept giving me
about structured streaming **_plus_** the side-effect bonuses on dependencies
were just too much to ignore any longer.

This shift to structured streaming has been merged into both the
[Python](https://github.com/bones-brigade/kafka-spark-openshift-python)
and [Java](https://github.com/bones-brigade/kafka-spark-openshift-java)
versions of this skeleton, and I am working on getting a Scala version up also.
I hope you found my experiences on this journey interesting, and if you need
some simple cloud-native style applications please check out the whole
[bones-brigade collection](https://github.com/bones-brigade). I plan to add
more applications here as I come across them in my daily hackings, and of
course I am always willing to consider contributions from anyone who is
interested in these topics =)

as always, have fun and happy hacking!
