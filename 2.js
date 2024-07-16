const { parse } = require('graphql')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { createYoga } = require('graphql-yoga')
const { createServer } = require('http')
const { useDeferStream } = require('@graphql-yoga/plugin-defer-stream')

const typeDefs = parse(/* GraphQL */ `
extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@composeDirective", "@extends", "@external", "@inaccessible", "@interfaceObject", "@key", "@override", "@provides", "@requires", "@shareable", "@tag"])

type Media @key(fields: "id") @interfaceObject {
  id: ID!
  teste: String @external
  author: Author! @requires(fields: "teste")
}

type Author {
  name: String!
}
`)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const resolvers = {
  Media: {
    __resolveReference: async (p) => {
      console.log(p)
      await delay(2000)
      return { ...p, author: { name: 'bla' } }
    }
  },
}

const yoga = createYoga({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [useDeferStream()]
})

const server = createServer(yoga)

server.listen(4002, () => {
  console.log(`🚀 Server ready at http://localhost:4002`)
})
