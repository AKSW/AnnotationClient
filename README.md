*Main repository at https://github.com/rmeissn/LDOW2016_PF_Client*

# Annotation Client for the LDOW2016 Pingback Feedback
**using feedback protocol on linked data**

JavaScript/HTML component, which have to be included in a website for RDF browsing like [DBpedia](http://de.dbpedia.org/).
Enables the user to create comment resources as plain comments or patches of the current resource.

## Requirements
* Browser with ECMAScript 6 support
* JQuery in version 1.11.2 and higher (if jQuery is not available it will be loaded by the script)
* RESTful access to RDF Formats like JSON to the current resource, like http://de.dbpedia.org/page/Leipzig?output=application%2Frdf%2Bjson for Leipzig

## Installation
Include FBA.js and the styles from example.html in your homepage.
Change the static URLs in FBA.js to match your domain.

### Greasemonkey
If you want to install this app as [Greasemonkey](http://greasespot.net/) ([plugin](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)) user script, just point your browser to to location of `FBE.user.js` in your local file system. (Be aware of the “side effects”!)

## Side effects
We include Bootstrap asynchronously, so take care of your CSS class names.



The work was done as part of [AKSW](aksw.org).
