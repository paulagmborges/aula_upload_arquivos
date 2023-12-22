require('dotenv').config()

const express = require('express')

const multer = require('./multer')

const aws = require('aws-sdk')

const endpoint = new aws.Endpoint('s3.us-east-005.backblazeb2.com')

const s3 = new aws.S3({
    endpoint,
    credentials:{
        accessKeyId:'005b4567a9c7bef0000000001',
        secretAccessKey:'K005saSKlVcaNIpZzjOZi+wZ9AgN1Z4'
 }
})

const app = express()

app.use(express.json())

app.post('/upload', multer.single('arquivo'), async (req, res) => {
    const { file }= req
    try {
        const arquivo = await s3.upload({
          Bucket:'paulagb',
          Key: `imagens/${file.originalname}`,
          Body:file.buffer,
          contentType:file.mimetype
        }).promise()
        return res.json(arquivo)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.message)
    }
    
})

app.post('/upload-multiple', multer.array('arquivo'), async (req, res) => {
    const { files }= req
    console.log(files)
    try {
        const resultado = []
        for (const file of files){
        const arquivo = await s3.upload({
          Bucket:'paulagb',
          Key: `imagens/multiplas/${file.originalname}`,
          Body:file.buffer,
          contentType:file.mimetype
        }).promise()

        resultado.push({
            arquivo
        })
        return res.json(resultado)}
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.message)
    }
    
})

app.get('/arquivos', async (req, res) => {

    try {
        const arquivos = await s3.listObjects({
        Bucket: 'paulagb'
    }).promise()
    return res.json(arquivos.Contents)
    } catch (error) {

        return res.status(500).json(error.message)

    }
    
})
app.delete('/arquivo' , async (req,res) => {
    const{file} = req.query
    try {
        await s3.deleteObject({
            Bucket:process.env.BACKBLAZE_BUCKET,
            Key:file
        }).promise()
        return res.status(204).json()
    } catch (error) {
        return res.status(500).json(message.error)
    }

})

app.listen(3000)