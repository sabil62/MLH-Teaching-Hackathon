const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')

const repo = require('./repo')
require('dotenv').config()

const app = express()
app.use(bodyParser.urlencoded({extended : true}))

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send(port)
})

app.post('/addData', async (req, res) => {
    const dataToAdd = [1,2,3]
    
    fs.writeFile('public/data.json', JSON.stringify(dataToAdd), (err)=>{
        if (err){console.log(err)}
    })  

    res.send('Data added.')
})

const port = process.env.PORT || 3001
app.listen(port, () =>{
    console.log(`App is listening at pot ${port}`)
})

