if(process.env.NODE_ENV !=="production"){
    require('dotenv').config()
}
const express = require('express');
const app=express();
const expressLayouts=require('express-ejs-layouts');
const indexRouter= require('./routes/index')
const authorRouter= require('./routes/authors')
const bookRouter= require('./routes/books')
const bodyParser = require('body-parser')
const methodOverride=require('method-override')
//set our view engine
app.set('view engine','ejs')
//set where our views are going to come
app.set('views',__dirname+'/views')
//set where our layout need to be creted
app.set('layout','layouts/layout')
app.use(methodOverride('_method'))

app.use(expressLayouts)
app.use('/',indexRouter)
app.use('/authors',authorRouter)
app.use('/books',bookRouter)
app.use(bodyParser.urlencoded({limit:'10mb',extended:false}))
//where our public files are going to be
app.use(express.static('public'))
//mongo server setup
const mongoose= require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser:true
})
const db=mongoose.connection
db.on('error',error => console.error(error))
db.once('open',()=>console.log("connected to mongoose "))

//app listen to port
app.listen(process.env.Port || 3000)

