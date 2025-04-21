const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Notes");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const transporter = require("../config/nodemailerConfig");
const schedule = require("node-schedule");
const mongoose = require("mongoose");

// Route 1: Get all the notes using: GET "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }
});

// Route 2: Add a new note using: POST "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description should not be less than a word").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

// Route 3: Update an existing note using: PUT "/api/notes/updatenote". Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("You are not authorized");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some internal error occurred");
  }
});

// Route 4: Delete an existing note using: DELETE "/api/notes/deletenote". Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // Allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("You are not authorized");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some internal error occurred");
  }
});

// Route 5: Set up notification for a specific note using: POST "/api/notes/getNotification". Login required
router.post(
  "/getNotification",
  fetchuser,
  [
    body("noteId", "Enter a valid note ID").isMongoId(),
    body("date", "Enter a valid future date")
      .isISO8601()
      .custom((value) => {
        const inputDate = new Date(value);
        const now = new Date();
        if (inputDate <= now) {
          throw new Error("Date must be in the future");
        }
        return true;
      }),
    body("message", "Message must be at least 5 characters").isLength({
      min: 5,
    }),
    body("notification", "Notification must be a boolean").isBoolean(),
  ],
  async (req, res) => {
    try {
      const { noteId, date, message, notification } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate note exists and belongs to the user
      let note = await Note.findById(noteId);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      if (note.user.toString() !== req.user.id) {
        return res
          .status(401)
          .json({
            error:
              "You are not authorized to schedule notifications for this note",
          });
      }

      // Update note with notification details
      note.notification = notification;
      note.sendDate = new Date(date);
      await note.save();

      // Fetch user's email from User model
      const user = await User.findById(req.user.id);
      if (!user || !user.email) {
        return res.status(400).json({ error: "User email not found" });
      }

      // Schedule email
      schedule.scheduleJob(note.sendDate, async () => {
        try {
          await transporter.sendMail({
            from: `"iWillNotify" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your iWillNotify Notification",
            text: `Dear ${req.user.name},\n\n${message}\n\nBest regards,\nThe iWillNotify Team`,
            html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2>iWillNotify Notification</h2>
                            <p>Dear ${req.user.name},</p>
                            <p>${message}</p>
                            <p>Best regards,<br>The iWillNotify Team</p>
                        </div>
                    `,
          });
          console.log(
            `Notification email sent to ${user.email} for note ${note._id}`
          );
        } catch (error) {
          console.error("Error sending notification email:", error);
        }
      });

      res.json({ success: "Notification scheduled", note });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some internal error occurred");
    }
  }
);

module.exports = router;
