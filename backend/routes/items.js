const router = require('express').Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// Add item
router.post('/', auth, async (req, res) => {
    try {
        const { itemName, description, type, location, contactInfo } = req.body;
        
        if (!itemName || !description || !type || !location || !contactInfo) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const newItem = new Item({
            itemName,
            description,
            type,
            location,
            contactInfo,
            userId: req.user
        });

        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().populate('userId', 'name').sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get items by search
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        const items = await Item.find({
            itemName: { $regex: name, $options: 'i' }
        }).populate('userId', 'name');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('userId', 'name');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item
router.put('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.userId.toString() !== req.user) {
            return res.status(401).json({ message: 'User not authorized to update this item' });
        }

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.userId.toString() !== req.user) {
            return res.status(401).json({ message: 'User not authorized to delete this item' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
