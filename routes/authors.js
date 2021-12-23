const express=require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
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
    res.redirect(`/authors/${author.id}`)
    // res.redirect('/authors')
  }catch(error){
    res.render('authors/new',{
        author:author,
        errorMessage:"Error Creating Author"
    })
  }
})

router.get('/:id',urlencodedParser,async(req,res)=>{

  try{
    const author=await Author.findById(req.params.id)
    const books = await Book.find({author:author.id}).limit(6).exec()
    res.render('authors/show',{
      author:author,
      booksByAuthor:books
    })
  }catch(err){
    console.log("err>>"+err)
    res.redirect('/')
  }
  // res.send('show Author'+req.params.id)

})

router.get('/:id/edit',async(req,res)=>{
  // res.send('edit author'+req.params.id)

  try{
    const author=await Author.findById(req.params.id)
    res.render("authors/edit",{author:author})
  }catch{
    res.redirect('/authors')
  }
  
})

router.put('/:id',urlencodedParser,async(req,res)=>{
  // res.send('update author'+req.params.id)
  let author

try{
  
  author = await Author.findById(req.params.id)
  console.log("author>>"+author)
  author.name = req.body.name
  console.log("author>>"+author)
  await author.save();
  res.redirect(`/authors/${author.id}`)
  
}catch{
  // console.log("author>>"+author)
  if(author == null){
    res.redirect('/')
  }else{
    res.render('authors/edit',{
      author:author,
      errorMessage:"Error updating Author"
  })
  }
 
}
})

router.delete('/:id',urlencodedParser,async(req,res)=>{
  // res.send('delete author'+req.params.id)
  let author
  try{
    author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect("/authors")
  }catch{
    if(author == null){
      res.redirect("/")
    }else{
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports=router