'use strict';
require('dotenv').config();
const aws = require('aws-sdk');
const ses = new aws.SES();
const s3 = new aws.S3();
const markup = require('markup-js');

const jsonResponse = (code, res) => {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify(res)
  }
};

module.exports.contact = (event, context, callback) => {

  let body = null;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    callback(null, jsonResponse(400, {code: 400, message: 'Expecting json'}))
    return
  }

  if (body.email === null) {
    callback(null, jsonResponse(400, {code: 400, message: 'Bad Request: Missing required member: email'}));
    return
  }
  if (body.inputs === null) {
    callback(null, jsonResponse(400, {code: 400, message: 'Bad Request: Missing required member: inputs'}));
    return
  }

  s3.getObject({
    Bucket: process.env.TEMPLATE_BUCKET,
    Key: process.env.EMAIL_TEMPLATE
  }, (err, data) => {
    if (err) {
      callback(null, jsonResponse(500, {code: 500, message: 'Internal Error: Failed to load template', stack: err.stack}));
      return
    }

    let tpl = data.Body.toString();


    let subject = markup.up(process.env.EMAIL_SUBJECT, body);
    let message = markup.up(tpl, body);

    let params = {
      Destination: {
        ToAddresses: [
          process.env.RECEIVER_EMAIL
        ]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: message,
            Charset: 'UTF-8'
          }
        }
      },
      Source: process.env.SENDER_EMAIL,
      ReplyToAddresses: [
        body.name + ' <' + body.email + '>'
      ]
    };

    ses.sendEmail(params, (err, data) => {
      if (err) {
        callback(null, jsonResponse(500, {code: 500, message: 'Internal Error: The email could not be sent', params: params, event:event, stack: err.stack}));
        return
      }
      callback(null, jsonResponse(200, {message: 'Contact request done.'}))
    })
  })
};
