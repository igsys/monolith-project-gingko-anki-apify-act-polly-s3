const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const AWS = require('aws-sdk')
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

    // console.log('pollyRes', res)

    const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
    const s3Params = {
        Bucket: 'gingko-anki-sync',
        Key: input.filename,
        ContentType: res.ContentType,
        Body: res.AudioStream
    }
    const s3Res = await s3.upload(s3Params, (err, data) => {
        console.log(err, data)
    }).promise()

    // console.log('s3Params', s3Params)
    // console.log('s3Res', s3Res)

    const output = s3Res

    console.log('output: ')
    console.dir(output)
    await Apify.setValue('OUTPUT', output)
})
