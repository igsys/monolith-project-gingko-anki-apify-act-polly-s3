const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const AWS = require('aws-sdk')

// Development Environment
const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') dotenv.load()

// Definition of the input
const INPUT_TYPE = `{
    text: String,
    language: String,
    gender: String,
    format: String,
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
    console.log('ACCESS', process.env.AWS_ACCESS_KEY_ID)
    console.log('SECRET', process.env.AWS_SECRET_ACCESS_KEY)
    console.log('REGION', process.env.AWS_REGION)

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
                }
            case 'french':
                switch (gender) {
                    case 'm': return 'Mathieu'
                    case 'f': return 'Celine'
                }
            case 'japanese':
                switch (gender) {
                    case 'm': return 'Takumi'
                    case 'f': return 'Mizuki'
                }
            case 'korean':
                switch (gender) {
                    case 'm': return 'Seoyeon'
                    case 'f': return 'Seoyeon'
                }
            case 'german':
                switch (gender) {
                    case 'm': return 'Hans'
                    case 'f': return 'Vicki'
                }
            case 'spanish':
                switch (gender) {
                    case 'm': return 'Enrique'
                    case 'f': return 'Conchita'
                }
            case 'italian':
                switch (gender) {
                    case 'm': return 'Giorgio'
                    case 'f': return 'Carla'
                }
            case 'russian':
                switch (gender) {
                    case 'm': return 'Maxim'
                    case 'f': return 'Tatyana'
                }
            case 'portuguese':
                switch (gender) {
                    case 'm': return 'Cristiano'
                    case 'f': return 'Ines'
                }
            default: return ''
        }
    }

    const pollyParams = {
        OutputFormat: input.format,
        SampleRate: '8000',
        Text: input.text,
        TextType: 'text',
        VoiceId: getVoiceId(input.language, input.gender)
    }

    // const polly = new AWS.Polly({
    //     signatureVersion: 'v4',
    //     region: process.env.AWS_REGION
    // })
    const polly = new AWS.Polly()

    const res = await polly.synthesizeSpeech(pollyParams, (err, data) => {
        if (err) {
            console.log(err.code)
        } else if (data) {
            return data
        }
    }).promise()

    let json = JSON.stringify(bufferOne);

    // Store the output
    const output = {
        input,
        audio: res.AudioStream
    }
    console.log('output: ', output)
    await Apify.setValue('OUTPUT', output)
})
