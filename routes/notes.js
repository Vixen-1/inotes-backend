const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser')
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route 1: get all the notes using: GET "/api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res)=>{
    try{
        const note =  await Note.find({user: req.user.id})
        res.json(note)
    }catch(error){
        console.error(error.message);
        res.status(500).send("some error occurred");
    }
})

//Route 2: add the new notes using: POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description should not be less than a word").isLength({min: 5}),
  ], async (req, res)=>{
    try{
        const {title, description, tag} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note ({
            title, description, tag, user: req.user.id
        })
        const saveNote = await note.save()
        res.json(saveNote)
    } catch(error){
        console.error(error.message);
        res.status(500).send("some error occured");
}
})

//Route 3: update the existing note using: PUT "/api/notes/updatenote". login required
router.put('/updatenote/:id', fetchuser, async (req, res)=>{
        const {title, description, tag} = req.body;
        try{
            // create newNote object
            const newNote = {};
            // if title is given then set newNotes's title as title
            if (title){newNote.title = title}
            if(description){newNote.description = description}
            if(tag){newNote.tag = tag}

            // find the note to be updated and update it.
            let note = await Note.findById(req.params.id)
            if (!note){
                return res.status(404).send("Not Found")
            }

            if (note.user.toString() !== req.user.id){
                return res.status(401).send("You are not authorized");
            }

            note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
            res.json({note})
        }catch(error){
            console.error(error.message);
            res.status(500).send("some internal error occurred");
        }
})

//Route 4: delete the existing note using: POST "/api/notes/deletenote". login required
router.delete('/deletenote/:id', fetchuser, async (req, res)=>{   
    try{
        // find the note to be deleted and delete it.
        let note = await Note.findById(req.params.id)
        if (!note){
            return res.status(404).send("Not Found")
        }
        //allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id){
            return res.status(401).send("You are not authorized");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"success":"Note has been deleted", note: note})
    }catch(error){
        console.error(error.message);
        res.status(500).send("some internal error occured");
    }
})

module.exports = router;