# Annotation Client for the LDOW2016 Pingback Feedback
**using feedback protocol on linked data**

JavaScript/HTML/CSS component, which has to be included in a website for RDF browsing like [DBpedia](http://dbpedia.org/).
Enables the user to create comment resources as plain comments or patches of the current resource.

## Requirements
* Browser with ECMA2015 support
* JQuery in version 1.9.1 and higher (if jQuery is not available it will be requested by the script)
* link to the original resource : <link rel="alternate" type="application/json" href="..." />
* link to a ResourceHostingService: <link rel="resourcehostingservice" href="..." />
* link to a PingbackService: <link rel="pingback" href="..." />
* RESTful access or content negotiation to RDF Formats like application/rdf+json of the linked resource, e.g. http://de.dbpedia.org/page/Leipzig?output=application%2Frdf%2Bjson for Leipzig

## Installation
Basically you have to include **FBE.js** as a javascript dependency into your page. To work as expected you'll also have to include some third party libraries like Bootstrap and Jquery. All of these prerequisites are listed inside **example.html**.

Please check for fallback URLs in FBE.js to match your specific requirements.

### Greasemonkey
If you want to install this page extension as a [Greasemonkey](http://greasespot.net/) ([plugin](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)) user script, just point your browser to the location of `FBE.user.js` in your local file system. In addition, you have to incomment lines 512 to 521 of FBE.js. (Be aware of the “side effects”!)

## Side effects
We are doing our styling with Bootstrap. When your already using an up to date version of Bootstrap: Great! If not, please include the shipped prefixed_bootstrap.css. With this file, we tried to minimize side effects of the bootstrap styling. Remember to check for side effects!



The work was done as part of [AKSW](aksw.org).
