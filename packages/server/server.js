import * as url from 'node:url';
import * as path from 'node:path';
import fastify from 'fastify';
import {makeExecutableSchema} from '@graphql-tools/schema';
import connectionString from '../db/connection-string.js';
import * as db from './src/db.js';
import dev from './src/dev.js';

const app = fastify({
  logger: {
    prettyPrint: dev
      ? {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        }
      : false,
  },
});

app.register(import('@fastify/cors'));

const dirname = url.fileURLToPath(new URL('.', import.meta.url));
app.register(import('@fastify/static'), {
  root: path.resolve(dirname, '../client/dist'),
});

app.register(import('@fastify/postgres'), {
  connectionString,
});

const typeDefs = `
  type Topping {
    id: Int!
    name: String!
    type: String!
  }

  type Pizza {
    id: Int!
    name: String!
    image: String
    toppings: [Topping]!
  }

  type Query {
    toppingList: [Topping]!
    pizzaList: [Pizza]!
    pizza(id: Int!): Pizza!
  }
`;

const loaders = {
  Pizza: {
    toppings: (queries, context) =>
      db.getToppingsForPizzas(
        queries.map((q) => q.obj),
        context.app,
      ),
  },
};

const resolvers = {
  Query: {
    toppingList: (_, __, context) => db.getToppings(context.app),
    pizzaList: (_, __, context) => db.getPizzas(context.app),
    pizza: (_, {id}, context) => db.getPizza(context.app, id),
  },
};

app.register(import('mercurius'), {
  schema: makeExecutableSchema({typeDefs, resolvers}),
  loaders,
  graphiql: true,
});

app.register(import('mercurius-cache'), {
  ttl: 10,
  all: true,
});

// Hello world
app.get('/hello', (request, reply) => reply.send('hello world'));

export default app;
