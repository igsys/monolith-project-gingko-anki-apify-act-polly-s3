const Apify = require('apify');
const request = require('request');
const ApifyClient = require('apify-client');
const md5 = require('md5')
const Promise = require('bluebird')
const AWS = require('aws-sdk');

const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN
});


const keyValueStores = apifyClient.keyValueStores;

const requestPromised = async (opts) => {
  return new Promise((resolve, reject) => {
    request(opts, (error, response, body) => {
      if (error) return reject(error);
      resolve({ body: body, response: response });
    });
  });
};

Apify.main(async () => {
  // Get input of your act
  const input = await Apify.getValue('INPUT');
  console.log('INPUT')
  console.dir(input)

  const awsS3Params = {
    "params": {
      "Bucket": process.env.Bucket
    },
    "accessKeyId": process.env.accessKeyId,
    "secretAccessKey": process.env.secretAccessKey
  }

  console.log('BUCKET: ' + process.env.Bucket)
  const s3 = new AWS.S3(awsS3Params);

  if (input.prefix) {
    const data = await s3.listObjects({ Prefix: input.prefix, Marker: input.marker }).promise()
    console.dir(data)
  }
  if (input.analyze) {
    const data = await s3.getObject({ Key: input.analyze, ResponseContentType: 'application/json' }).promise()
    const string = data.Body.toString('utf8')

    await keyValueStores.putRecord({
      key: 's3' + input.analyze.replace(/\//g, '-'),
      contentType: 'application/json; charset=utf-8',
      body: data.Body,
      storeId: 'HdTCcZLH5KaK3zngE'
    })
  }
  if (input.delete) {
    for (let item of input.delete) {
      await s3.deleteObject({ Key: item }).promise()
      if (input.deleteParts) {
        for (let i = 0; i < 5; i++) {
          await s3.deleteObject({ Key: item + '/' + i.toString() }).promise()
        }
      }
    }
  }





});
