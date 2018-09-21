var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  message: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("Note", NoteSchema);
