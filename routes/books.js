const express=require('express')
const router = express.Router()
const multer =require('multer')
const path = require('path')
const Book = require('../models/book')
const Author = require('../models/author')
const fs= require('fs')
const bodyParser = require("body-parser");
const uploadPath = path.join('public',
Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/png','image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter:(req,file,callback)=>{
    callback(null,imageMimeTypes.includes(file.mimetype))
  }
})

const urlencodedParser = bodyParser.urlencoded({
    limit: "10mb",
    extended: false,
  });

//all books routes
router.get('/',async(req,res)=>{
  let searchOptions={}
  if(req.query.title !=null && req.query.title!==""){
      searchOptions.title=new RegExp(req.query.title,'i')
  }
  try{
  const books =await Book.find(searchOptions)
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
router.post('/',upload.single('cover'),async(req,res)=>{
const fileName= req.file != null ? req.file.filename : null
const book = new Book({
  title:req.body.title,
  author:req.body.author,
  publishDate:new Date(req.body.publishDate),
  pageCount:req.body.pageCount,
  coverImageName:fileName,
  description:req.body.description
})
console.log(book)
try{
  const newBook = await book.save()
  res.redirect('/books')
 }catch{
   if(book.coverImageName != null){
     removeBookCover(book.coverImageName)
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

module.exports=router