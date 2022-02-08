const mongoose = require('mongoose')

const NoticiaSchema = mongoose.Schema({
    title: String,
    content:String,
    category: String
})

const Noticia = mongoose.model('Noticia', NoticiaSchema)
module.exports = Noticia