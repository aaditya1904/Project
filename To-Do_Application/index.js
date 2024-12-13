const express = require('express')
const app = express();
const path = require('path')
const userModel = require('./model/user');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res)=>{
    res.render("index");
})

app.get('/read',async (req,res)=>{
    let user = await userModel.find();
    res.render("show",{user});
})

app.get('/delete/:id', async (req, res) => {
    await userModel.findOneAndDelete({_id: req.params.id})
    let user = await userModel.find()
    res.render('show', {user})
})

app.post('/addtask', async (req,res)=>{
    let {task,details} = req.body;
    let user = await userModel.create({
        title : task,
        details,
    })
    res.render("show")
})

app.get('/')


app.listen(3000);