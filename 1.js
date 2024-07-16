const { parse } = require('graphql')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { createYoga } = require('graphql-yoga')
const { createServer } = require('http')
const { useDeferStream } = require('@graphql-yoga/plugin-defer-stream')
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

setInterval(() => {
  pubsub.publish('COUNT', { count: 1 });
}, 1000)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const typeDefs = parse(/* GraphQL */ `
extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@composeDirective", "@extends", "@external", "@inaccessible", "@interfaceObject", "@key", "@override", "@provides", "@requires", "@shareable", "@tag"])

interface Media @key(fields: "id") {
  id: ID!
  title: String!
  teste: String @inaccessible
}

type Book implements Media @key(fields: "id") @key(fields: "title"){
  id: ID!
  title: String!
  teste: String
}

type Query {
  books: [Media!]
}

type Subscription {
  count: Int!
}
`)

const resolvers = {
  Query: {
    books: () => [
      { id: '1', title: 'Book 1', teste: 'teste' },
      { id: '2', title: 'Book 2', teste: 'teste' },
    ],
  },
  Media: {
    __resolveType: (media) => {
      return 'Book'
    },
  },
  Subscription: {
    count: {
      subscribe: () => pubsub.asyncIterator('count'),
    },
  },
}
const yoga = createYoga({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [useDeferStream()]
})

const server = createServer(yoga)

server.listen(4001, () => {
  console.log(`🚀 Server ready at http://localhost:4001`)
})
