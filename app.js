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
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes/random:
 *   get:
 *     tags:
 *       - Jokes
 *     summary: Get a random joke
 *     responses:
 *       200:
 *         description: A random joke
 */

//1. GET a random joke
app.get("/jokes/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * jokes.length);
  const randomJoke = jokes[randomIndex];
  res.json(randomJoke);
});

/**
 * @swagger
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes/{id}:
 *   get:
 *     tags:
 *       - Jokes
 *     summary: Get a specific joke by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the joke to retrieve
 *     responses:
 *       200:
 *         description: A joke object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 jokeText:
 *                   type: string
 *                 jokeType:
 *                   type: string
 *       404:
 *         description: Joke not found
 */

//2. GET a specific joke by ID
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
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes:
 *   get:
 *     tags:
 *       - Jokes
 *     summary: Get jokes filtered by type
 *     description: |
 *       You can filter jokes by the following types:
 *       - Science
 *       - Puns
 *       - Wordplay
 *       - Math
 *       - Food
 *       - Sports
 *       - Movies
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of jokes to filter by
 *     responses:
 *       200:
 *         description: List of jokes filtered by type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   jokeText:
 *                     type: string
 *                   jokeType:
 *                     type: string
 *       400:
 *         description: Missing joke type query parameter
 *       404:
 *         description: No jokes found for this type
 */

//3. GET jokes filtered by type
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
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes:
 *   post:
 *     tags:
 *       - Jokes
 *     summary: Add a new joke
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Master key for authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Joke created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 jokeText:
 *                   type: string
 *                 jokeType:
 *                   type: string
 *       403:
 *         description: Forbidden
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
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes/{id}:
 *   put:
 *     tags:
 *       - Jokes
 *     summary: Update a joke by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the joke to update
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Master key for authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joke updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 jokeText:
 *                   type: string
 *                 jokeType:
 *                   type: string
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Joke not found
 */

//5. PUT a specific joke by ID
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
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes/{id}:
 *   patch:
 *     tags:
 *       - Jokes
 *     summary: Partially update a joke by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the joke to update
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Master key for authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joke updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 jokeText:
 *                   type: string
 *                 jokeType:
 *                   type: string
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Joke not found
 */

//6. PATCH a specific joke by ID
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
 * tags:
 *   - name: Jokes
 *     description: Joke management endpoints
 */
/**
 * @swagger
 * /jokes/{id}:
 *   delete:
 *     tags:
 *       - Jokes
 *     summary: Delete a specific joke by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the joke to delete
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Master key for authorization
 *     responses:
 *       200:
 *         description: Joke deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Joke not found
 */

//7. DELETE a specific joke by ID
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
