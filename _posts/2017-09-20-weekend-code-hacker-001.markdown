---
layout: post
title:  "Weekend Code Hacker 001"
subtitle: "Building a bookmark service with the Django REST framework"
date: 2017-09-02
categories:
---

I used to be a huge fan of the old [Delicious](https://en.wikipedia.org/wiki/Delicious_(website)) bookmark service. When I first started using it they had a really nice extension for Firefox and it did exactly what I wanted. Sure, it had extra features, but I wasn't really concerned with them and they didn't get in my way. As with many space time loci in technology, it was a perfect storm of usability... for me.

Sadly, Delicious moved on and was bought and eventually shuttered. It was sad for me because I had fell into a common trap in cloud computing. Not owing my own data and experience. Sure, I had downloaded the ginormous JSON file containing all my bookmarks, but without some sort of way to easily traverse them it was pointless.

Anyways, for years I have been thinking about building my own bookmark microservice. Something that had just the features I wanted and nothing more. I definitely acknowledge the hard work of browser engineers who have been making the bookmarking experience better and better by adding cloud storage and even inter-browser data transfers. But, even with all that, I wanted something I could own, something to hack on, and something that did just what I want.

A couple months ago I finally started working on my dream, and as such the [Wire Hobo](https://github.com/elmiko/wire-hobo) was born. A personal traveling companion who would follow me on my wandering through the digital multi-verse. And as is the tradition of [hobo's](https://en.wikipedia.org/wiki/Hobo), he would leave [signs](https://en.wikipedia.org/wiki/Hobo#Hobo_signs_.28symbols.29) along the way. To mark the places we have been and the adventures that await.

Mind you, this is a bit whimsical, but I enjoy anthropomorpising software. It keeps things fun for a side project and it reminds me of one of my favorite movies, [Tron](https://en.wikipedia.org/wiki/Tron).

## Planning

The first thing I did when I started this journey was to figure out what I wanted for a user experience and how could I leverage pre-made tools. I knew I wanted a simple [REST style](https://en.wikipedia.org/wiki/Representational_state_transfer) server that could perform basic [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) on a set of URLs. I also wanted each stored URL to have an associated title and a series of free form metadata tags. This seemed simple enough and I knew there were a ton of frameworks that could help.

The reason I went with a REST server for this project is that I wanted to start with some simple command line tools for interacting with my bookmark store, and then later build up browser extensions that I could use to keep things in sync between the various machines I use.

With that in mind, the second major evaluation I did during the planning phases of this project was to lock down the technology stack I wanted to use. I knew I wanted something with Python as the base language and I didn't want to write a bunch of database interaction code. My favorite HTTP framework for Python is by far [Flask](http://flask.pocoo.org), but it doesn't have a default data persistence API and I didn't want to code a bunch of [SQLAlchemy](http://www.sqlalchemy.org/) stuff. This pretty much left me looking at [Django](https://djangoproject.com), which I have used for many projects but had never had much success with REST interfaces. I really like Django's database ORM layer and that made me think it would be really easy to model the data storage I wanted.

<img src="https://i.imgur.com/kWkXFFN.png" class="img-responsive center-block" alt="windmills">
<span class="pull-right">
[_original image by JDrewes_](https://commons.wikimedia.org/wiki/File:Don_Quixote_Style_Windmills_Tembleque_JD22032008.jpg)
</span>

## A note on tilting at windmills

I think it's important to acknowledge the problem I am trying to solve has already been solved in many different ways. From the inherent improved bookmarking functions inside modern browsers, to online services which provide cross-browser and cross-platform synchronization. I give huge credit to the communities out there that have worked hard to make these things better.

With that said, given my constraints this is a relatively small problem to attack and encompasses many technologies that I wish to learn more about. So, it seemed like a good project to take on as a weekend effort for as many months as it took me to get it functional. I encourage all people who are into coding to give themselves these small challenges to build things that improve their computing experience. I think this impulse harkens back to earlier days in the evolution of computing when there was a strong culture of bedroom inventors creating their own binary helpers to make their experiences in the digital world that much richer. It is in this spirit that I created the Wire Hobo and enjoy spending time on it, I'm especially happy as I have recently been able to start using it to actually **solve** my problems!

## Enter the Django REST framework

After some searching I found the [Django REST framework](https://www.django-rest-framework.org/) which seemed like the perfect marriage of Django with enough support classes and infrastructure for a modest REST service. I liked that the framework made a solid connection between Django's inherent ORM and the exposed routes and information for the data resources. This really made short work of the first leg of my building process. Big shoutout to the Django REST framework community, you folks are doing a stellar job!

It wasn't all roses for me though, there was a learning curve that I needed to get around in order for the Django REST framework to make sense. One of the sticking points I had was their notion of [serializers](https://www.django-rest-framework.org/api-guide/serializers/). The concept is simple enough, a serializer takes the data from its current format (eg JSON, database) and transforms it to a different format. But in practice it took me a few late nights to figure out the intricacies of working with that API.

Another note about the seriliazers. I'm not sure how you feel about REST interfaces, but I tend to spend a lot of time in the bike shed with them. I love to endlessly tinker with my own REST based projects, and often this leads me to want a great deal of control over the interface. This is where I've run into issues with the Django REST framework that I usually avoid in Flask. I'm sure there are ways to make the JSON input and output look exactly like I want, but when I start messing around with Django and get the feeling that I am working against the intentions of the framework I know to back off. This happened as I started getting into wanting to define my JSON more specifically, for better or worse I just needed to swallow my ego and let it be.

For the most part my development was very close to standard Django practice and I think I had a working prototype up within a weekend. But something I really wanted was a simple validation method for using my REST and browser clients. I know that the authentication methods in Django are web standards and they worked well in my initial tests, but ideally I wanted something like an API token that would allow or deny access. The cool thing about Django, and by extension the REST framework, is that the WSGI and HTTP pipelines can be inspected and altered through configuration. After a few nights of searching docs and reading up, I was ready to add my token based authentication plugin.

To start with, I changed the flow of Django in my setting to alter how the authentication was processed. I only wanted my API token method and an unauthenticated HTML method(more on this later). The `settings.py` changes looked something like this:

````
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'wire_hobo.auth.IndexHTMLAuthentication',
        'wire_hobo.auth.APIKeyHeaderAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
````

Note that I'm not actually hitting the Django settings values but going though the REST framework settings. You can see my 2 authenticators in the default classes.

Since I intended the Wire Hobo to be single user application, I decided to make the API key a value hashed with a standard algorithm. In this way I could store the hashed key in the settings and allow the user to transmit the key in their headers. The authentication middleware would then look at the non-hashed value in the headers, hash it and then check against a value in the settings. The middleware I ended up with was this:

````
class APIKeyHeaderAuthentication(authentication.BaseAuthentication):
    """Authenticate a request

    The request must contain the header `wire-hobo-apikey` which
    contains the key for gaining access to the trails.
    """
    def authenticate(self, request):
        apikey = request.META.get('HTTP_WIRE_HOBO_APIKEY')
        if apikey is None:
            return None
        sha = hashlib.sha512()
        sha.update(apikey)
        hd = sha.hexdigest()
        if hd != secrets.API_KEY:
            raise exceptions.AuthenticationFailed('Unknown API key')
        return (APIUser(), None)
````

The `APIUser` at the end which gets returned is just a simple wrapper on Django's anonymous user interface. All it does is report that the user is logged in, this allows the rest of the authentication chain to continue as normal.

````
class APIUser(models.AnonymousUser):
    def is_authenticated(self):
        return True
````

I mentioned earlier that I wanted to allow unauthenticated access for HTML as another change to the authentication pipeline. Although I don't normally like to create mixed-mode applications like this when architecting a service, I figured that putting a simple HTML page at the index would give me a nice visual feedback as a means of passive debugging. Also, another thing I didn't quite want from the Djago REST framework was its HTML interface. Mind you, it has a beautiful rich interface, I just didn't want it. I wanted to reduce the open surface and I did find some articles about suppressing the HTML interface, but I never quite got it working fully and decided to abandon that line of effort.

The authenticator for the HTML access was much simpler than the token one, I only needed to check the headers for the HTML content type request and the path from the client. Again, I used my anonymous user for the authentication:

````
class IndexHTMLAuthentication(authentication.BaseAuthentication):
    """Allow access to the index page

    The index page is meant to be public for html requests, this
    class simply allows access.
    """
    def authenticate(self, request):
        accept = request.META.get('HTTP_ACCEPT', '')
        if request.path == '/' and 'text/html' in accept:
            return (APIUser(), None)
        return None
````

## Plans for the future

I've been using the Wire Hobo for several weeks now and it is holding up great so far. I have a small command line utility and have been working on Firefox and Chromium WebExtensions a little bit as well. It's been really fun learning about the WebExtension side of this especially. The last time I tried to anything for Firefox was before all these standards got implemented fully, really nice to see.

Even though I have been using it, there is still a lot of little work to do. I need to update my code to have more tests(especially as I recently found an error with updating). The command line tool needs to get finished and the WebExtensions could use a bunch of polish. But hey, it's a great weekend coding activity and I love having a tool that actually solves a problem for me. I guess if I were more skilled with lumber I might have built a deck LOL.

Another step along the way here will be to fully containerizing this application. I plan to make it cloud native at some point with full testing and a CI/CD workflow, hopefully to a public OpenShift instance. At that point, I might remove the HTML interface and go full on microservice with a separate application running the front end.

But, all that will take some time. I just starting to understand how the Django test suite works. I'll definitely revisit the WebExtensions in a future Weekend Code Hacker, and maybe I'll revisit Wire Hobo in a year or something to see how things have progressed. I hope you found this read an enjoyable break from you normal activities, and I **really** hope you have a Wire Hobo of your own.

Happy Hacking!
