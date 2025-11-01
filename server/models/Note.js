const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		default: "Untitled Note",
	},
	content: {
		type: String,
		default: "",
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	subject: {
		type: String,
		enum: [
			"Math",
			"Science",
			"English",
			"Hindi",
			"Social Studies",
			"Computer Science",
			"Art",
			"Music",
			"General",
		],
		default: "General",
	},
	isFavorite: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update timestamp on save
noteSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

// Indexes for better performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model("Note", noteSchema);
