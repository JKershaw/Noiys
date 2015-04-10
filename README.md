Noiys
=====

Built over Christmas 2013 as my first attempt at a TDD pet project. The code is super rough (I was learning NodeJs at the time).

There is only one environment variable which needs to be set:

MONGO_CONNECTION_STRING is your MongoDb connection string. You ca use a free tier of somewhere like MongoLab as a host.

To enable the Home feed, a Cron job calling "node recalculate_scores.js" every now and again is needed.