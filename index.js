const db = require('./data/hubs-model.js');
// bring express into the project
const express = require('express');
// create a "server" object
const server = express();

//
// express.json() is a parser function...
// if json *text* is in the body, this method
// will parse it into an actual object, so that
// when we access req.body, it will be an actual object.
//
server.use(express.json());

server.get('/', (req, res) => {
    res.send('hello world from express!!');
});

//
// sample api method that returns the date/time
// as an ISO-8601 string
//
server.get('/now', (req, res) => {
    const now = new Date().toISOString();
    res.send(now);
});

// 
// an api endpoint to return a list of "hubs"
// from the database.
//
// db.find() returns them all.
// 
server.get('/hubs', (req, res) => {
    db.find()
    .then(hubs => {
        res.status(200).json(hubs);
    })
    .catch(err => {
        res.status(500).json({sucess:false, err});
    });
});

//
// notice the "parameter" in the url...
// preceding a url "part" name with a colon designates
// it as a "parameter". You can access all parameters
// that are identified in the URL using the req.params
// property (it's an object). 
//
// these are typically "variable" parts of the url that
// will change the response. In this case, the thing after
// "/hubs" is considered to be an id, and we want to get
// it and search the database for it, returning what we
// find.
//
server.get('/hubs/:id', (req, res) => {
    const {id} = req.params;

    db.findById(id)
    .then(hub => {
        if (hub) {
            res.status(200)
                .json(hub);
        } else {
            res.status(404)
                .json({success:false, message:'I cannot find the hub you are looking for.'});
        }
    })
    .catch(err => {
        res.status(500)
            .json({success:false, err});
    });
});

//
// POST is typically used to create a new object in whatever
// collection you specify in the URL.
//
// the data that is used to create the new object is passed
// in the request body as a "stringified" JSON object.
//
// the middleware express.json() is applied to every request.
// this is a parser that checks to see if the body type is 
// supposed to be "json", and then converts the text of the
// body into an actual json object that can be accessed using
// req.json.
// 
// If the body is in the right format, the object we get back
// can be passed right to the DB method to add a record to the
// DB.
//
// we really should do some validation of the format of the
// object, rather than just relying on the DB to reject it.
// but this is just a demo, so...
//
server.post('/hubs', (req, res) => {
    const hubInfo = req.body;

    db.add(hubInfo) 
        .then(hub => {
            res.status(201).json({sucess:true, hub});
        })
        .catch(err => {
            res.status(500).json({sucess:false, err});
        });
});

//
// this is like a combination of GET with an "id" parameter
// (to indicate which record to get), and POST with data
// in the body. POST is used to create a new record.
//
// in this endpoint, PUT is used to update an existing record.
// the "id" parameter identifies the record, and the body of
// the PUT request contains the new data we want to store in 
// the database.
//
// again, we are relying on the DB to reject the "update" 
// request if the object in req.body doesn't have the
// right fields/data.
//
server.put('/hubs/:id', (req, res) => {
    const {id} = req.params;
    const hubInfo = req.body;

    db.update(id, hubInfo)
    .then(updated => {
        if(updated) {
            res.status(200).json({success:true, updated});
        } else {
            res.status(404).json({success:false, message:'I cannot find the hub you are looking for'});
        }
    })
    .catch(err => {
        res.status(500).json({success:false, err});
    });
});

//
// note the "id" parameter... so we know which record
// to delete.
// 
// making a call to DELETE /hubs (without an id) won't match 
// this handler, so no delete will be tried. We don't have a 
// handler for DELETE /hubs, and if you try, express() will
// respond with an error (basically saying "there is no handler
// for that METHOD and /url")
//
server.delete('/hubs/:id', (req, res) => {
    const {id} = req.params;

    db.remove(id)
    .then(deleted => {
        if(deleted) {
            res.status(204).end();
        } else {
            res.status(404).json({success:false, message:'I cannot find the hub you are looking for'});
        }
    })
    .catch(err => {
        res.status(500).json({success:false, err});
    });
})

server.listen(4000, () => {
    console.log('server listening on port 4000');
});

