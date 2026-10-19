notes.elmiko.dev
================

A collection of notes that I am keeping on various topics.

The `drafts` directory contains work in progress material, it is most likely
unedited and quite possible unintelligible, user be warned.

local development with containers
---------------------------------

build the development container 

```
podman build -t elmiko.github.io .
```

run the container against current directory, auto-updating

```
podman run --rm -it -p 4000:4000 -v $(pwd):/opt/site:Z elmiko.github.io:latest
```
