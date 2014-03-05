
0.2.8 / 2014-03-05 
==================

 * fix Model.run destroying listeners

0.2.7 / 2014-02-21 
==================

 * Added in 'creating' event.
 * remove duplicate type

0.2.6 / 2013-12-21 
==================

 * Saving and removing now have appropriate `fn` signatures depending on Model
 vs instance listeners. Ie. `User.on('saving', function(instance, done))` and
 `user.on('saving', function(done));`

0.2.5 / 2013-12-17 
==================
 * removed map-series dependency

0.2.4 / 2013-12-01 
==================

 * Fix for where .set would call methods if they existed, even if they weren't attrs

0.2.3 / 2013-11-30 
==================

 * added emit `attar` when an attar is added/changed

0.2.2 / 2013-11-30
==================

 * remove recursive component.json fail

0.2.1 / 2013-11-29
==================

 * only validate on `saving` event (@ramitos)
 * runs 'saving' events in series and validates on each (@ramitos) [fixes #11]

0.2.0 / 2013-11-12
==================

 * Release 0.2.0
 * Implemented more robust events [References #21]
 * Merged Model.configure into overloaded Model.use
 * Remove _sync and rely on sync-plugins to monkey patch sync methods. Closes #12
 * Switched 'change:blah' to 'change blah' [References #17]

0.1.7 / 2013-10-11
==================

  * repair .changed()

0.1.6 / 2013-09-27
==================

 * Fixed a bug where redefining an attribute would cause all of its options to be lost

0.1.5 / 2013-09-20
==================

  * Add hack for clone on BSON objects

0.1.4 / 2013-09-14
==================

  * Bug fix on default values where they are null or 0
  * Added create event

0.1.3 / 2013-09-14
==================

  * Added res signature for save and remove.

0.1.2 / 2013-07-26
==================

 * fixed emitter for lame npm upgrade

0.1.1 / 2013-06-16
==================

 * Greatly simplified dirty checking on array and object
 * Switched to cloning for accessor
 * Updated dirty checking, again
 * Removed superagent dep
 * Fixed defaults not being copys
 * Styling changes
 * Added some basic docs

0.0.9 / 2013-03-11
==================

  * ignore values set that aren't in the schema
  * added npm test for travis
  * tests looking good

0.0.8 / 2013-03-03
==================

  * fixed context bug

0.0.7 / 2013-02-26
==================

  * emitter hack for now

0.0.6 / 2013-02-20
==================

  * fix clone
  * return false if no results found with #get
  * added 'error' events

0.0.5 / 2013-02-05
==================

  * added clone internally
  * fixed objectid cloning issue

0.0.4 / 2013-02-05
==================

  * only add attributes that are in the schema
  * server can "fix" attributes when it send data back down to client
  * starting tests

0.0.3 / 2012-12-31
==================

  * fixed race condition
  * update only sends changed

0.0.2 / 2012-12-28
==================

  * start with not dir\ty
  * made sync removable

0.0.1 / 2012-12-27
==================

  * Initial release
