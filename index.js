import express from "express";
import bodyParser from "body-parser";
import { jokes } from "./jokes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const masterKey = process.env.MASTER_KEY;

app.use(bodyParser.urlencoded({ extended: true }));

const renderUrl = process.env.RENDER_EXTERNAL_URL;
const localUrl = `http://localhost:${port}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Jokes API",
      version: "1.0.0",
      description: "API documentation for the Jokes API",
    },
    servers: [
      {
        url: renderUrl || localUrl,
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//1. GET a random joke
app.get("/jokes/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * jokes.length);
  const randomJoke = jokes[randomIndex];
  res.json(randomJoke);
});

/**
 * @swagger
 * /jokes/random:
 *   get:
 *     summary: Get a random joke
 *     responses:
 *       200:
 *         description: A random joke
 */

//2. GET a specific joke
app.get("/jokes/:id", (req, res) => {
  const jokeId = parseInt(req.params.id);
  const joke = jokes.find((joke) => joke.id === jokeId);
  if (joke) {
    res.json(joke);
  } else {
    res.status(404).json({ message: "Joke not found" });
  }
});

/**
 * @swagger
 * /jokes/{id}:
 *   get:
 *     summary: Get a specific joke by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the joke to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A specific joke
 *       404:
 *         description: Joke not found
 */

//3. GET a jokes by filtering on the joke type
app.get("/jokes", (req, res) => {
  const jokeType = req.query.type;
  if (jokeType) {
    const filteredJokes = jokes.filter(
      (joke) => joke.jokeType.toLowerCase() === jokeType.toLowerCase()
    );
    if (filteredJokes && filteredJokes.length > 0) {
      res.json(filteredJokes);
    } else {
      res.status(404).json({ message: "No jokes found for this type" });
    }
  } else {
    res.status(400).json({ message: "Please provide a joke type" });
  }
});

/**
 * @swagger
 * /jokes:
 *   get:
 *     summary: Get jokes by type
 *     parameters:
 *       - name: type
 *         in: query
 *         required: false
 *         description: Type of jokes to filter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of jokes
 *       400:
 *         description: Bad request
 *       404:
 *         description: No jokes found for this type
 */

//4. POST a new joke
app.post("/jokes", (req, res) => {
  const userKey = req.query.key;
  const newJoke = {
    id: jokes.length + 1,
    jokeText: req.body.text,
    jokeType: req.body.type,
  };
  if (userKey === masterKey) {
    jokes.push(newJoke);
    res.status(201).json(newJoke);
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

/**
 * @swagger
 * /jokes:
 *   post:
 *     summary: Add a new joke
 *     parameters:
 *       - name: key
 *         in: query
 *         required: true
 *         description: Master key for authentication
 *         schema:
 *           type: string
 *       - name: joke
 *         in: body
 *         required: true
 *         description: The joke text and type
 *         schema:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             type:
 *               type: string
 *     responses:
 *       201:
 *         description: Joke created
 *       403:
 *         description: Forbidden
 */

//5. PUT a joke
app.put("/jokes/:id", (req, res) => {
  const jokeId = parseInt(req.params.id);
  const userKey = req.query.key;
  const jokeIndex = jokes.findIndex((joke) => joke.id === jokeId);
  if (jokeIndex !== -1) {
    const updatedJoke = {
      ...jokes[jokeIndex],
      jokeText: req.body.text,
      jokeType: req.body.type,
    };
    if (userKey === masterKey) {
      jokes[jokeIndex] = updatedJoke;
      res.json(jokes[jokeIndex]);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } else {
    res.status(404).json({ message: "Joke not found" });
  }
});

/**
 * @swagger
 * /jokes/{id}:
 *   put:
 *     summary: Update a joke
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the joke to update
 *         schema:
 *           type: integer
 *       - name: key
 *         in: query
 *         required: true
 *         description: Master key for authentication
 *         schema:
 *           type: string
 *       - name: joke
 *         in: body
 *         required: true
 *         description: The updated joke text and type
 *         schema:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             type:
 *               type: string
 *     responses:
 *       200:
 *         description: Joke updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Joke not found
 */

//6. PATCH a joke
app.patch("/jokes/:id", (req, res) => {
  const jokeId = parseInt(req.params.id);
  const userKey = req.query.key;
  const jokeIndex = jokes.findIndex((joke) => joke.id === jokeId);
  if (jokeIndex !== -1) {
    const updatedJoke = {
      ...jokes[jokeIndex],
      jokeText: req.body.text || jokes[jokeIndex].jokeText,
      jokeType: req.body.type || jokes[jokeIndex].jokeType,
    };
    if (userKey === masterKey) {
      jokes[jokeIndex] = updatedJoke;
      res.json(jokes[jokeIndex]);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } else {
    res.status(404).json({ message: "Joke not found" });
  }
});

/**
 * @swagger
 * /jokes/{id}:
 *   patch:
 *     summary: Partially update a joke
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the joke to partially update
 *         schema:
 *           type: integer
 *       - name: key
 *         in: query
 *         required: true
 *         description: Master key for authentication
 *         schema:
 *           type: string
 *       - name: joke
 *         in: body
 *         required: false
 *         description: The updated joke text and/or type
 *         schema:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             type:
 *               type: string
 *     responses:
 *       200:
 *         description: Joke partially updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Joke not found
 */

//7. DELETE Specific joke
app.delete("/jokes/:id", (req, res) => {
  const jokeId = parseInt(req.params.id);
  const userKey = req.query.key;
  const jokeIndex = jokes.findIndex((joke) => joke.id === jokeId);
  if (jokeIndex !== -1) {
    if (userKey === masterKey) {
      jokes.splice(jokeIndex, 1);
      res.status(200).json({ message: "Joke deleted" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } else {
    res.status(404).json({ message: "Joke not found" });
  }
});

/**
 * @swagger
 * /jokes/{id}:
 *   delete:
 *     summary: Delete a specific joke
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the joke to delete
 *         schema:
 *           type: integer
 *       - name: key
 *         in: query
 *         required: true
 *         description: Master key for authentication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joke deleted
 */

//8. DELETE All jokes
app.delete("/jokes", (req, res) => {
  const userKey = req.query.key;
  if (userKey === masterKey) {
    jokes.length = 0;
    res.status(200).json({ message: "All jokes deleted" });
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

app.listen(port, () => {
  console.log(`Successfully started server on port ${port}.`);
});
