const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const AWS = require('aws-sdk')

// Development Environment
const dotenv = require('dotenv')
if (process.env.NODE_ENV !== 'production') dotenv.load()

// Definition of the input
const INPUT_TYPE = `{
    message: Maybe String,
    text: String,
    language: String,
    gender: String
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
        OutputFormat: 'mp3',
        SampleRate: '8000',
        Text: input.text,
        TextType: 'text',
        VoiceId: getVoiceId(input.language, input.gender)
    }

    const polly = new AWS.Polly({
        signatureVersion: 'v4',
        region: process.env.AWS_REGION
    })
    // console.log('polly', polly)

    // await polly.describeVoices({}, (err, data) => {
    //     console.log('polly.describeVoices()')
    //     if (err) {
    //         console.log(err, err.stack)
    //     } else {
    //         availableVoices = data.Voices;
    //     }
    // }).promise()

    const res = await polly.synthesizeSpeech(pollyParams, (err, data) => {
        if (err) {
            console.log(err.code)
        } else if (data) {
            // console.log(data)
            return data
            // if (data.AudioStream instanceof Buffer) {
            //     Fs.writeFile("./speech.mp3", data.AudioStream, function (err) {
            //         if (err) {
            //             return console.log(err)
            //         }
            //         console.log("The file was saved!")
            //     })
            // }
        }
    }).promise()

    // console.log(res)

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

    // var s3 = new AWS.S3();

    // // Create a bucket and upload something into it
    // var bucketName = 'node-sdk-sample-1';
    // var keyName = 'hello_world.txt';

    // s3.createBucket({ Bucket: bucketName }, function () {
    //     var params = { Bucket: bucketName, Key: keyName, Body: 'Hello World!' };
    //     s3.putObject(params, function (err, data) {
    //         if (err)
    //             console.log(err)
    //         else
    //             console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
    //     });
    // });
    // S3
    // var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    // var params = { Bucket: 'myBucket', Key: 'myImageFile.jpg' };
    // var file = require('fs').createWriteStream('/path/to/file.jpg');
    // s3.getObject(params).createReadStream().pipe(file);

    // Store the output
    const output = {
        // message: `${input.message} Hello my friend!`
        text: `${input.text}`,
        data: res.AudioStream
    }
    console.log('output: ', output)
    await Apify.setValue('OUTPUT', output)
})
