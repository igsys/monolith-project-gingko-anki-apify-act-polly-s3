const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const AWS = require('aws-sdk')
// const Base64 = require('js-base64').Base64
// const bufferJson = require('buffer-json')
const streamingS3 = require('streaming-s3')

// Development Environment
const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') dotenv.load()

// Definition of the input
const INPUT_TYPE = `{
    text: String
    language: String
    gender: String
    filename: String
}`

Apify.main(async () => {
    // Fetch the input and check it has a valid format
    // You don't need to check the input, but it's a good practice.
    const input = await Apify.getValue('INPUT')
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:')
        console.log(INPUT_TYPE)
        console.log('Received input:')
        console.dir(input)
        throw new Error('Received invalid input')
    }

    // Here's the place for your magic...
    console.log(`Input text to Amazon Polly: ${input.text}`)
    // console.log('ACCESS', process.env.AWS_ACCESS_KEY_ID)
    // console.log('SECRET', process.env.AWS_SECRET_ACCESS_KEY)
    // console.log('REGION', process.env.AWS_REGION)

    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
        // region: 'ap-northeast-1'
        // region: 'us-west-2'
    })

    const getVoiceId = (lang, gender = 'm') => {
        switch (lang) {
            case 'english':
                switch (gender) {
                    case 'm': return 'Matthew'
                    case 'f': return 'Joanna'
                    default: return 'Matthew'
                }
            case 'french':
                switch (gender) {
                    case 'm': return 'Mathieu'
                    case 'f': return 'Celine'
                    default: return 'Mathieu'
                }
            case 'japanese':
                switch (gender) {
                    case 'm': return 'Takumi'
                    case 'f': return 'Mizuki'
                    default: return 'Takumi'
                }
            case 'korean':
                switch (gender) {
                    case 'm': return 'Seoyeon'
                    case 'f': return 'Seoyeon'
                    default: return 'Seoyeon'
                }
            case 'german':
                switch (gender) {
                    case 'm': return 'Hans'
                    case 'f': return 'Vicki'
                    default: return 'Hans'
                }
            case 'spanish':
                switch (gender) {
                    case 'm': return 'Enrique'
                    case 'f': return 'Conchita'
                    default: return 'Enrique'
                }
            case 'italian':
                switch (gender) {
                    case 'm': return 'Giorgio'
                    case 'f': return 'Carla'
                    default: return 'Giorgio'
                }
            case 'russian':
                switch (gender) {
                    case 'm': return 'Maxim'
                    case 'f': return 'Tatyana'
                    default: return 'Maxim'
                }
            case 'portuguese':
                switch (gender) {
                    case 'm': return 'Cristiano'
                    case 'f': return 'Ines'
                    default: return 'Cristiano'
                }
            default: return ''
        }
    }

    const pollyParams = {
        OutputFormat: 'mp3',
        // OutputFormat: 'json',
        SampleRate: '8000',
        Text: input.text,
        TextType: 'text',
        VoiceId: getVoiceId(input.language, input.gender)
    }

    const polly = new AWS.Polly()

    const res = await polly.synthesizeSpeech(pollyParams, (err, data) => {
        if (err) {
            console.log(err.code)
        } else if (data) {
            return data
        }
    }).promise()

    console.log('res', res)

    const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
    const s3Params = {
        // Bucket: 'https://s3-ap-northeast-1.amazonaws.com/gingko-anki-sync',
        Bucket: 'gingko-anki-sync',
        Key: input.filename,
        ContentType: res.ContentType,
        Body: res.AudioStream
    }
    const s3Res = await s3.upload(s3Params, (err, data) => {
        console.log(err, data)
    }).promise()

    console.log('s3Params', s3Params)
    console.log('s3Res', s3Res)

    // const writeAudioStreamToS3 = (aws_publicBucket, audioStream, filename) =>
    //     putObject(aws_publicBucket, filename, audioStream, 'audio/mp3').then(res => {
    //         if (!res.ETag) throw res
    //         else return {
    //             msg: 'File successfully generated.',
    //             ETag: res.ETag,
    //             url: `https://s3-eu-west-1.amazonaws.com/${aws_publicBucket}/${filename}`
    //         }
    //     })

    // const putObject = (bucket, key, body, ContentType) => {
    //     const s3 = new AWS.S3()
    //     s3.putObject({
    //         Bucket: bucket,
    //         Key: key,
    //         Body: body,
    //         ContentType
    //     }).promise()
    // }

    // writeAudioStreamToS3('gingko-anki-sync', res.audioStream, input.filename)
    // // Uploading to S3 bucket
    // // https://github.com/FallenTech/streaming-s3
    // const uploader = new streamingS3(
    //     res.AudioStream,
    //     {
    //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //     },
    //     {
    //         // Bucket: 'example.streaming-s3.com',
    //         // Key: 'video.mp4',
    //         // ContentType: 'video/mp4'
    //         Bucket: 'gingko-anki-sync',
    //         Bucket: 'https://s3-ap-northeast-1.amazonaws.com/gingko-anki-sync',
    //         Key: input.filename,
    //         ContentType: res.ContentType
    //     }
    // )


    // uploader.on('data', function (bytesRead) {
    //     console.log(bytesRead, ' bytes read.');
    // });

    // uploader.on('part', function (number) {
    //     console.log('Part ', number, ' uploaded.');
    // });

    // // All parts uploaded, but upload not yet acknowledged.
    // uploader.on('uploaded', function (stats) {
    //     console.log('Upload stats: ', stats);
    // });

    // uploader.on('finished', function (resp, stats) {
    //     console.log('Upload finished: ', resp);
    // });

    // uploader.on('error', function (e) {
    //     console.log('Upload error: ', e);
    // });

    // uploader.begin(); // important if callback not provided.

    // var uploader = new streamingS3(
    //     fStream,
    //     {
    //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //     },
    //     {
    //         Bucket: 'https://s3-ap-northeast-1.amazonaws.com/gingko-anki-sync',
    //         // Bucket: 'gingko-anki-sync',
    //         Key: input.filename,
    //         ContentType: res.ContentType
    //         // Bucket: 'example.streaming-s3.com',
    //         // Key: 'video.mp4',
    //         // ContentType: 'video/mp4'
    //     }, function (e, resp, stats) {
    //         if (e) return console.log('Upload error: ', e);
    //         console.log('Upload stats: ', stats);
    //         console.log('Upload successful: ', resp);
    //     }
    // )

    // https://developers.google.com/drive/v3/web/quickstart/nodejs

    // Store the output
    // const output = {
    //     crawledAt: new Date(),
    //     name: 'apify/igsys/polly-s3',
    //     input,
    //     filename: input.filename,
    //     audio: res.AudioStream
    // }

    // console.dir(JSON.stringify(new Buffer('hello')))
    // => '{"type":"Buffer","data":[104,101,108,108,111]}'

    // const objJsonStr = JSON.stringify(res.AudioStream)
    // const objJsonB64 = new Buffer(objJsonStr).toString('base64')
    // const objJsonB64 = new Buffer(res.AudioStream).toString('base64')

    // const output = res.AudioStream
    // const output = objJsonB64
    // const output = 'base64:' + res.AudioStream.toString('base64')
    // const output = Base64.encode(res.AudioStream)
    const output = res
    // console.log(res.AudioStream.data)

    // const output = JSON.stringify(res.AudioStream, bufferJson.replacer)

    console.log('output: ')
    // console.dir(output)
    await Apify.setValue('OUTPUT', output)
})
