import { readFileSync } from 'fs'
import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { getStitchedSchemaFromSupergraphSdl } from '@graphql-tools/federation'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'

const yoga = createYoga({
  schema: getStitchedSchemaFromSupergraphSdl({
    // This doesn't have to be from a file system, it can be fetched via HTTP from a schema registry
    supergraphSdl: readFileSync('./supergraph.graphql', 'utf-8'),
    httpExecutorOpts: {
      fetch: (url, options) => {
        console.log(url, options)

        return fetch(url, options)
      },
      FormData,
      File,
    }
  }),
  plugins: [
    useDeferStream()
  ]
})

const server = createServer(yoga)

server.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
})
