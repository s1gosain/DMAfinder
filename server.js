const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const turf = require('@turf/turf');
const data = require('./data.json');

app.use(bodyParser.json());
//grab array of DMA-regions ie polygons (each individual object)
const dataArr = data.features;

app.get('/findDMA', (req, res) => {
  //don't do all this work if missing a parameter!!!
  if (!req.body.lat || !req.body.lng) return res.status(400).send('missing parameter')
  else {
    let lat = req.body.lat;
    let lng = req.body.lng;
    let pt = turf.point([lng, lat]);
    //loop through array of polygons (grabbed above)
    //in each child object (i.e.polygon) go to coordinates array
    dataArr.forEach((x) => {
      //grab coordinates array
      let coordinates = x.geometry.coordinates;
      let code = x.properties.dma_code;
        coordinates.forEach((y) => {
          //was getting error without following line about needing a minimum of 4 end points
          if (y[0].length > 3) {
            let poly = turf.polygon(y);
       //does the point lie in the polygon? if true (boolean returned), send DMA code ID
             if (turf.booleanPointInPolygon(pt, poly)) return res.status(200).send(`${code}`)
          }
        })
      //otherwise continue in loop (do nothing)
  })
    //if didn't match any polygon, return error message.
    return res.status(400).send('not a DMA');
  }
})



app.listen(3000, () => console.log('listening on 3000'));