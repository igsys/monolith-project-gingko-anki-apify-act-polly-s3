const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const AWS = require('aws-sdk')

// Development Environment
const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') dotenv.load()

// Definition of the input
const INPUT_TYPE = `{
    message: Maybe String,
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
    console.log(`Input message: ${input.message}`)

    // AWS.config.credentials = {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // }
    // AWS.config.region = process.env.AWS_REGION

    await AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    })

    const params = {
        OutputFormat: 'mp3',
        SampleRate: '8000',
        Text: 'Amazonから最新情報です。Kindleの電子書籍読み上げサービス「Kindle Speach」がリリースしました。無料のコンテンツをお試しできますが、いかがでしょうか？',
        TextType: 'text',
        VoiceId: 'Mizuki'
    }

    const polly = new AWS.Polly()
    console.log('polly', polly)

    // polly.describeVoices({})
    //     .then((err, data) => {
    //         console.log('polly.describeVoices().then:')
    //     })

    // async function describeVoices() {
    await polly.describeVoices({}, (err, data) => {
        console.log('polly.describeVoices()')
        if (err) {
            console.log(err, err.stack)
        } else {
            availableVoices = data.Voices;
        }
    })
    // }

    // await describeVoices()

    // await polly.synthesizeSpeech(params, (err, data) => {
    //     console.log('params', params)
    //     if (err) console.log(err, err.stack) // an error occurred
    //     else console.log(data)           // successful response
    //     // var elementId = 'audioElement' + new Date().valueOf().toString()
    //     // var audioElement = document.createElement('audio')
    //     // audioElement.setAttribute('id', elementId)
    //     // document.body.appendChild(audioElement)
    //     // var uInt8Array = new Uint8Array(data.AudioStream)
    //     // var arrayBuffer = uInt8Array.buffer
    //     // var blob = new Blob([arrayBuffer])
    //     // var url = URL.createObjectURL(blob)
    //     // audioElement.src = url
    //     // audioElement.play()
    // })

    // S3
    // var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    // var params = { Bucket: 'myBucket', Key: 'myImageFile.jpg' };
    // var file = require('fs').createWriteStream('/path/to/file.jpg');
    // s3.getObject(params).createReadStream().pipe(file);

    // Store the output
    const output = {
        message: `${input.message} Hello my friend!`
    }
    console.log('output: ', output)
    await Apify.setValue('OUTPUT', output)
})
