const express=require('express')
const router = express.Router()
const Author = require('../models/author')
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({
    limit: "10mb",
    extended: false,
  });

//all author routes
router.get('/',async(req,res)=>{
    let searchOptions={}
    if(req.query.name !=null && req.query.name!==""){
        searchOptions.name=new RegExp(req.query.name,'i')
    }
    try{
    const authors =await Author.find(searchOptions)
    res.render('authors/index',
    {authors:authors,
    searchOptions:req.query 
    })
    }catch{
    res.redirect('/')
    }
    
})
//new author route
router.get('/new',(req,res)=>{
    res.render("authors/new",{author:new Author()})
})

//creating new author
router.post('/',urlencodedParser,async(req,res)=>{
  const author=new Author({
      name:req.body.name
  })
  try{
    const newAuthor=await author.save();
    res.redirect('/authors')
  }catch(error){
    res.render('authors/new',{
        author:author,
        errorMessage:"Error Creating Author"
    })
  }
})

module.exports=router