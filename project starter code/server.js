import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
});

app.get("/filteredimage", async (req, res) => {
    //    1. validate the image_url query
    const {image_url} = req.query;
    if (!image_url) {
        console.error("image_url is required");
        return res.status(400).send("image_url is required");
    }

    const cleanedImageUrl = image_url.replace(/^"|"$/g, '');

    try {
        // Check if the URL is accessible
        const response = await fetch(cleanedImageUrl);
        if (!response.ok) {
            throw new Error("Image URL is not accessible");
        }

        //    2. call filterImageFromURL(image_url) to filter the image
        const filteredpath = await filterImageFromURL(cleanedImageUrl);

        //    3. send the resulting file in the response
        res.sendFile(filteredpath, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Error sending file");
            }
            //    4. deletes any files on the server on finish of the response
            await deleteLocalFiles([filteredpath]);
        });
    } catch (error) {
        console.error("Error filtering image:", error);
        return res.status(500).send("Error filtering image: " + error.message);
    }


});


// Start the Server
app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
});
