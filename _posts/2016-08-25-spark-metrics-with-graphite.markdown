---
layout: post
title:  "Examining Apache Spark metrics with Graphite"
date:   2016-08-25
categories:
---

When working with [Apache Spark](https://spark.apache.org/) it is often
useful, and occasionally necessary, to inspect the internal metrics which
are created. According to the
[documentation](https://spark.apache.org/docs/1.2.1/monitoring.html#metrics),
Spark includes these metrics and even enables a default metrics servlet.
Sadly, i was unable to get that servlet to produce any other than `302`
responses. Happily though, I found that the
[Graphite project](https://github.com/brutasse/graphite-api) provides an
excellent sink that is support by Spark.

Graphite is quite a deep project that can not only log metrics and provide
a covenient RESTful interface to retrieve them, it can also generate graph
images in a variety of formats. Thankfully, the
[Fedora](https://fedoraproject.org) maintainers have included the Graphite
packages in the repositories which made putting together a small container for
it quite easy.

I'll leave the gory details of the creating the image out for now, but you can
see my resulting
[Dockerfile](https://github.com/elmiko/dockerfiles/blob/master/fullgraphite/Dockerfile)
if you are curious. For the bold, you can download my container image from
`docker.io/elmiko/fullgraphite`. With the image created, I run the container
with the following command:

```
$ docker run --rm -it -p 2003:2003 -p 8000:8000 docker.io/elmiko/fullgraphite
```

This will run Graphite, exposing the ports for the web server and the Carbon
database. It will also give an interactive prompt and remove the container
once it is finished. To stop this, I simply give a `Control-C`.

With Graphite running, I now focus on setting up my Spark to expose its
metrics. I am running a local copy of the
[Spark binary](https://spark.apache.org/downloads.html) that I have
downloaded from their site. Inside my `$SPARK_HOME` there is a `conf`
directory that holds the example configuration file
`metrics.properties.example`. Rename this file to `metrics.properties` in the
same directory and your Spark is now ready to start exposing metrics beyond
the defaults.

Simply renaming the file is not good enough for what we want though, so I
added the following lines to my properties:

```
*.sink.graphite.class=org.apache.spark.metrics.sink.GraphiteSink
*.sink.graphite.host=127.0.0.1
*.sink.graphite.port=2003
*.sink.graphite.period=10
*.sink.graphite.unit=seconds

master.source.jvm.class=org.apache.spark.metrics.source.JvmSource
worker.source.jvm.class=org.apache.spark.metrics.source.JvmSource
driver.source.jvm.class=org.apache.spark.metrics.source.JvmSource
executor.source.jvm.class=org.apache.spark.metrics.source.JvmSource
```

The first group of lines will instruct Spark to use the Graphite metrics sink,
and to look for the Carbon server at `127.0.0.1:2003`. The second group of
lines are commented out in the example file, uncommenting these will turn on
all the available metrics.

With the Graphite server running and Spark configured to send metrics to it,
I am now ready to start producing data. At this point I start my Spark process
in the shell mode to inspect if things are working:

```
$ ./bin/spark-shell
Using Spark's default log4j profile: org/apache/spark/log4j-defaults.properties
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel).
16/08/25 14:32:08 WARN NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
16/08/25 14:32:09 WARN SparkContext: Use an existing SparkContext, some configuration may not take effect.
Spark context Web UI available at http://10.0.1.110:4040
Spark context available as 'sc' (master = local[*], app id = local-1472149929532).
Spark session available as 'spark'.
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 2.0.0
      /_/

Using Scala version 2.11.8 (OpenJDK 64-Bit Server VM, Java 1.8.0_101)
Type in expressions to have them evaluated.
Type :help for more information.

scala>
```

Ok, great, Spark is running. Now I will make a request to the Graphite server
with the [httpie tool](https://github.com/jkbrzt/httpie).

```
$ http localhost:8000/metrics/index.json
HTTP/1.1 200 OK
Connection: close
Content-Length: 7247
Content-Type: application/json
Date: Thu, 25 Aug 2016 18:34:06 GMT
Server: gunicorn/19.4.1

[
        "carbon.agents.391706f85fb4-a.avgUpdateTime",
        "local-1472149929532.driver.BlockManager.disk.diskSpaceUsed_MB",
        "local-1472149929532.driver.BlockManager.memory.maxMem_MB",
        "local-1472149929532.driver.BlockManager.memory.memUsed_MB",
        "local-1472149929532.driver.BlockManager.memory.remainingMem_MB",
        "local-1472149929532.driver.CodeGenerator.compilationTime.count",
        "local-1472149929532.driver.CodeGenerator.compilationTime.max",
        "local-1472149929532.driver.CodeGenerator.compilationTime.mean",
        "local-1472149929532.driver.CodeGenerator.compilationTime.min",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p50",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p75",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p95",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p98",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p99",
        "local-1472149929532.driver.CodeGenerator.compilationTime.p999",
        "local-1472149929532.driver.CodeGenerator.compilationTime.stddev",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.count",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.max",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.mean",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.min",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.p50",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.p75",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.p95",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.p98",
        "local-1472149929532.driver.CodeGenerator.generatedClassSize.p99",
        "local-1472149929532.driver.CodeGenerator.generatedMethodSize.p999",
        "local-1472149929532.driver.CodeGenerator.generatedMethodSize.stddev",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.count",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.max",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.mean",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.min",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p50",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p75",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p95",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p98",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p99",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.p999",
        "local-1472149929532.driver.CodeGenerator.sourceCodeSize.stddev",
        "local-1472149929532.driver.DAGScheduler.job.activeJobs",
        "local-1472149929532.driver.DAGScheduler.job.allJobs",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.count",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.m15_rate",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.m1_rate",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.m5_rate",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.max",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.mean",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.mean_rate",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.min",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p50",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p75",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p95",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p98",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p99",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.p999",
        "local-1472149929532.driver.DAGScheduler.messageProcessingTime.stddev",
        "local-1472149929532.driver.DAGScheduler.stage.failedStages",
        "local-1472149929532.driver.DAGScheduler.stage.runningStages",
        "local-1472149929532.driver.DAGScheduler.stage.waitingStages",
        "local-1472149929532.driver.jvm.PS-MarkSweep.count",
        "local-1472149929532.driver.jvm.PS-MarkSweep.time",
        "local-1472149929532.driver.jvm.PS-Scavenge.count",
        "local-1472149929532.driver.jvm.PS-Scavenge.time",
        "local-1472149929532.driver.jvm.heap.committed",
        "local-1472149929532.driver.jvm.heap.init",
        "local-1472149929532.driver.jvm.heap.max",
        "local-1472149929532.driver.jvm.heap.usage",
        "local-1472149929532.driver.jvm.heap.used",
        "local-1472149929532.driver.jvm.non-heap.committed",
        "local-1472149929532.driver.jvm.non-heap.init",
        "local-1472149929532.driver.jvm.non-heap.max",
        "local-1472149929532.driver.jvm.non-heap.usage",
        "local-1472149929532.driver.jvm.non-heap.used",
        "local-1472149929532.driver.jvm.pools.Code-Cache.committed",
        "local-1472149929532.driver.jvm.pools.Code-Cache.init",
        "local-1472149929532.driver.jvm.pools.Code-Cache.max",
        "local-1472149929532.driver.jvm.pools.Code-Cache.usage",
        "local-1472149929532.driver.jvm.pools.Code-Cache.used",
        "local-1472149929532.driver.jvm.pools.Compressed-Class-Space.committed",
        "local-1472149929532.driver.jvm.pools.Compressed-Class-Space.init",
        "local-1472149929532.driver.jvm.pools.Compressed-Class-Space.max",
        "local-1472149929532.driver.jvm.pools.Compressed-Class-Space.usage",
        "local-1472149929532.driver.jvm.pools.Compressed-Class-Space.used",
        "local-1472149929532.driver.jvm.pools.Metaspace.committed",
        "local-1472149929532.driver.jvm.pools.Metaspace.init",
        "local-1472149929532.driver.jvm.pools.Metaspace.max",
        "local-1472149929532.driver.jvm.pools.Metaspace.usage",
        "local-1472149929532.driver.jvm.pools.Metaspace.used",
        "local-1472149929532.driver.jvm.pools.PS-Eden-Space.committed",
        "local-1472149929532.driver.jvm.pools.PS-Eden-Space.init",
        "local-1472149929532.driver.jvm.pools.PS-Eden-Space.max",
        "local-1472149929532.driver.jvm.pools.PS-Eden-Space.usage",
        "local-1472149929532.driver.jvm.pools.PS-Eden-Space.used",
        "local-1472149929532.driver.jvm.pools.PS-Old-Gen.committed",
        "local-1472149929532.driver.jvm.pools.PS-Old-Gen.init",
        "local-1472149929532.driver.jvm.pools.PS-Old-Gen.max",
        "local-1472149929532.driver.jvm.pools.PS-Old-Gen.usage",
        "local-1472149929532.driver.jvm.pools.PS-Old-Gen.used",
        "local-1472149929532.driver.jvm.pools.PS-Survivor-Space.committed",
        "local-1472149929532.driver.jvm.pools.PS-Survivor-Space.init",
        "local-1472149929532.driver.jvm.pools.PS-Survivor-Space.max",
        "local-1472149929532.driver.jvm.pools.PS-Survivor-Space.usage",
        "local-1472149929532.driver.jvm.pools.PS-Survivor-Space.used",
        "local-1472149929532.driver.jvm.total.committed",
        "local-1472149929532.driver.jvm.total.init",
        "local-1472149929532.driver.jvm.total.max",
        "local-1472149929532.driver.jvm.total.used"
        ]
```

Success! Now we are able to run extended queries on the Graphite server to
[acquire more information](http://graphite-api.readthedocs.io/en/latest/api.html)
. It should also be noted that since I started Spark in shell mode that the
metrics look different than if I had started it in master mode. I leave it up
to you to explore and discover what else these metrics can provide.

Enjoy, and as always happy hacking =)
