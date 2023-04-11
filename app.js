//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aaron:test123@cluster0.qd0l2c9.mongodb.net/todolistdDB");

const itemsSchema = {
  name: String
};



const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your Todo list." 
})
const item2 = new Item ({
  name: "Hit the + button to add a new item." 
})
const item3 = new Item ({
  name: "<-- Hit this to delete an item." 
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


  

app.get("/", function(req, res) {
  
  Item.find().then(function(items){
    if (items.length === 0) {
      Item.insertMany([item1, item2, item3]).then(function() {
      console.log("All good")
      
    }).catch(function(error){
      console.log(error)
    });
    res.redirect("/")
  } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }});
  
  });


  



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
  item.save()
  res.redirect("/")
  } else {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/" + listName);
    });
  }
  }
);

app.post("/delete", function(req,res){
  const removedItem = req.body.checkbox;
  const listName = req.body.listName

  if (listName === "Today") {
  Item.findByIdAndRemove(removedItem).then(function(removedItem){
    
    res.redirect("/")
  })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: removedItem}}}).then(function(foundList){
      res.redirect("/" + listName)
    })
  }
})

app.get("/:listTitle", function(req,res){
  const requestedList = _.capitalize(req.params.listTitle);
  
  List.findOne({name: requestedList}).then(function(foundList){
    
      if (!foundList){
        // create new list
        const list = new List({
          name: requestedList,
          items: defaultItems
        })
          list.save();
          
          res.redirect("/" + requestedList)
      } else {
        // show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        
      }
    })
  

  
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfuly");
});
