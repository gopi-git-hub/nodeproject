const express=require('express')
const router = express.Router()

const path = require('path')
const Book = require('../models/book')
const Author = require('../models/author')
const fs= require('fs')
const bodyParser = require("body-parser");

const imageMimeTypes = ['image/jpeg','image/png','image/gif']


const urlencodedParser = bodyParser.urlencoded({
    limit: "10mb",
    extended: false,
  });

//all books routes
router.get('/',async(req,res)=>{
  
  let query = Book.find()
  if(req.query.title !=null && req.query.title!==""){
      query=query.regex('title',new RegExp(req.query.title,'i'))
  }
  if(req.query.publishedAfter !=null && req.query.publishedAfter!==""){
    query=query.gte('publishDate',req.query.publishedAfter)
}
if(req.query.publishedBefore !=null && req.query.publishedBefore!==""){
  query=query.lte('publishDate',req.query.publishedBefore)
}
  try{
  const books =await query.exec()
  res.render('books/index',
  {books:books,
  searchOptions:req.query 
  })
  }catch{
  res.redirect('/')
  }
   
})
//new book route
router.get('/new',async (req,res)=>{
  renderNewpage(res,new Book())
})

//creating new book
router.post('/',urlencodedParser,async(req,res)=>{

const book = new Book({
  title:req.body.title,
  author:req.body.author,
  publishDate:new Date(req.body.publishDate),
  pageCount:req.body.pageCount,
  description:req.body.description
})
saveCover(book,req.body.cover)
// console.log(book)
try{
  const newBook = await book.save()
  res.redirect('/books')
 }catch{
   if(book.coverImageName != null){
    //  removeBookCover(book.coverImageName)
   }
  renderNewpage(res,book,true)

 }
})

function removeBookCover(fileName){
fs.unlink(path.join(uploadPath,fileName),err=>{
  if(err) console.error(err)
})
}

async function renderNewpage(res,book,hasError=false  ){
  try{
    const authors = await Author.find({});
    const params ={
      authors:authors,
      book:book
    }
    if(hasError) params.errorMessage = "Error Creating Book"
    res.render('books/new',params)

  }catch{
    res.redirect('/books')
  }
}

function saveCover(book,coverEncoded){
  if(coverEncoded == null)return
  const cover= JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data,'base64')
    book.coverImageType = cover.type
  }
}
module.exports=router