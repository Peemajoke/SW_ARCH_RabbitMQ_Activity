#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

// amqp.connect('amqp://localhost', function(error0, connection) {
//   if (error0) {
//     throw error0;
//   }
//   connection.createChannel(function(error1, channel) {
//     if (error1) {
//       throw error1;
//     }
//     var queue = 'order_queue';

//     channel.assertQueue(queue, {
//       durable: true
//     });
//     channel.prefetch(1);
//     console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
//     channel.consume(queue, function(msg) {
//         var secs = msg.content.toString().split('.').length - 1;
//         console.log(" [x] Received");
//         console.log(JSON.parse(msg.content));

//         setTimeout(function() {
//         console.log(" [x] Done");
//         channel.ack(msg);
//         }, secs * 1000);
//     }, {
//     noAck: false
//     });
//   });
// });  

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: kitchen.js [type_of_food]");
  process.exit(1);
}

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'food_order';

    channel.assertExchange(exchange, 'direct', {
      durable: true
    });

    channel.assertQueue('', {
      exclusive: true
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach(function(foodType) {
        channel.bindQueue(q.queue, exchange, foodType);
      });

      channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
      }, {
        noAck: true
      });
    });
  });
});