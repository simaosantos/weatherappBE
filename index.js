const express = require('express')
const app = express();
const port = 8000;
const https = require('https');
const cors = require('cors');
require('dotenv').config()
const log = require('log-to-file');


app.use(cors())
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)






app.get('/cidade/:cidade', async (req, res) => {


    const { rawHeaders, httpVersion, method, socket, url } = req;
    const { remoteAddress, remoteFamily } = socket;

    log("Request Received : " + JSON.stringify({
        rawHeaders,
        httpVersion,
        method,
        remoteAddress,
        remoteFamily,
        url
    }), 'my-log.log');
    console.log("Chegou pedido a /cidade/:cidade ");
    console.log("cidade pedida", req.params.cidade)
    let cidade = req.params.cidade;
    let finalObject = await getweatherinfo(cidade);


    console.log("final message", finalObject)
    res.send(finalObject);


});

app.post('/cidades', async (req, res) => {

    let errorMessage = null;

    req.on("error", error => {
        errorMessage = error.message;
    });




    res.on("finish", () => {
        const { rawHeaders, httpVersion, method, socket, url, body, er } = req;
        const { remoteAddress, remoteFamily } = socket;

        log("Request Received : " +
            JSON.stringify( {
                rawHeaders,
                body,
                errorMessage,
                httpVersion,
                method,
                remoteAddress,
                remoteFamily,
                url
            }),
            'my-log.log');

    });

    console.log("Chegou pedido a /cidades ");
    console.log(req.body)
    let cidades = req.body.cidades;
    //console.log("lista cidades", cidades)
    let result = []

    for (let i = 0; i < cidades.length; i++) {
        let infoCidade = await getweatherinfo(cidades[i]);
        result.push(infoCidade);
    }
    console.log(result)
    res.send(result);

})


function getweatherinfo(cidade) {
    return new Promise(function (resolve, reject) {
        let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + cidade + '&appid=' + process.env.APIKEY + '&units=metric&lang=PT';
        https.get(url , (resp) => {
            let data = '';
            let message = "";
            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                //console.log(JSON.parse(data).main.temp);


                const { statusCode, statusMessage } = resp;



              
                log("Request sent  : " + JSON.stringify({
                        url,
                        statusCode,
                        statusMessage,
                    }),'my-log.log');

                message = JSON.parse(data);
                console.log(message)
                if (message && message != '' && message.main) {
                    let temp = message.main.temp.toString()
                    let cityname = message.name.toString()

                    let timesunrise = message.sys.sunrise.toString();
                    let timesunset = message.sys.sunset.toString();
                    let id = message.sys.id.toString();
                    let weather = message.weather[0].main.toString();
                    let description = message.weather[0].description.toString();


                    let finalObject = {
                        description: description,
                        weather: weather,
                        id: id,
                        temperature: temp,
                        sunrise: timesunrise,
                        sunset: timesunset,
                        name: cityname
                    }
                    resolve(finalObject);
                }

            });

        

        }).on("error", (err) => {
            
            let errorMessage =  err.message;
            log("Request sent  : " +
                JSON.stringify({
                    url,
                    errorMessage,
                }),
                'my-log.log');
            resolve(error);
        });

    })
}




app.listen(port, () => {
    console.log(`Magic happens on ${port}!`)
});