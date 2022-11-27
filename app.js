//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-manoj:Test123@cluster0.g8oimmx.mongodb.net/todolistDB")
const itemSchema = mongoose.Schema({ name: String })
const Item = mongoose.model("Item", itemSchema)

const defaultItems = [];
const Item1 = new Item({
  name: "To-buy-food"
})
const Item2 = new Item({
  name: "To-cook-food"
})
const Item3 = new Item({
  name: "To-eat-food"
})
defaultItems.push(Item1, Item2, Item3)
const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]

})

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, item) {
    if (err) {
      console.log(err);
    }
    else {

      if (item.length == 0) {

        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log("Error found!!")
          }
          else {
            console.log("Succesfully inserted data")
          }
        })
      }
      const day = date.getDate();
      res.render("list", { listTitle: "Today", newListItems: item });

    }
  })
});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const title = req.body.list;
  const Item4 = new Item({ name: item });
  List.findOne({ name: title }, function (err, result) {
    if (!err) {
      if (result) {
        result.items.push(Item4);
        result.save();
        res.redirect("/" + title)

      }
      else {

        //  defaultItems.push(Item4)
        //  Item.insertMany(Item4)
        Item4.save();
        res.redirect("/");
      }

    }

  })


});
app.post("/delete", function (req, res) {
  let id = req.body.checkboxClicked;
  let title = req.body.hiddenValue;
  List.findOneAndUpdate({ name: title }, { $pull: { items: { _id: id } } }, function (err, result) {

    if (!err) {
      if (result) {

        res.redirect("/" + title)

      }
      else {
        Item.findByIdAndRemove(id, function (err) {
          if (err) {
            console.log(err)
          }
          else {
            console.log("succesfully deleted")
          }
        })
        res.redirect("/")

      }
    }
  })

})

app.get("/:customList", function (req, res) {
  let cutstomListName = _.upperFirst(_.lowerCase(req.params.customList));
  List.findOne({ name: cutstomListName }, function (err, result) {
    if (err) {
      console.log(err)
    }
    else {
      if (!result) {

        const lists = new List(
          {
            name: cutstomListName,
            items: defaultItems
          }
        )
        lists.save()
        res.redirect("/" + cutstomListName)

      }
      else {
        res.render("list", { listTitle: cutstomListName, newListItems: result.items })

      }
    }
  })

})

app.get("/about", function (req, res) {
  res.render("about");
});




app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
