import express from 'express'
import dotenv from 'dotenv'
import playerRoutes from './adapters/http/playerRoutes.js'
import itemRoutes from './adapters/http/itemRoutes.js'
import pokemonRoutes from './adapters/http/pokemonRoutes.js'
import mapRoutes from './adapters/http/mapRoutes.js'
import pokeapiProxy from './adapters/http/pokeapiProxy.js'

dotenv.config()
const app = express()
app.use(express.json())

app.use('/player', playerRoutes)
app.use('/player', itemRoutes)
app.use('/player', pokemonRoutes)
app.use('/map', mapRoutes)
app.use('/pokeapi', pokeapiProxy)

app.listen(3000, () => console.log('API running on port 3000'))
