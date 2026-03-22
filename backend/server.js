const express = require('express');
const cors = require('cors');
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({ storage: storage });


const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


const readData = () => {
    const rawData = fs.readFileSync('./data.json', 'utf-8');
    return JSON.parse(rawData);
};


const writeData = (data) => {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2), 'utf-8');
};


app.get('/api/records', (req, res) => {
    const records =readData();
    res.json(records);
});


app.post('/api/records', (req, res) => {
    let records = readData();
    
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    
    const newRecord = {
        id: newId,
        name: req.body.name,
        amount: Number(req.body.amount), 
        category: "C", 
        file: null
    };

    records.push(newRecord);
    writeData(records); 
    
    res.status(201).json(newRecord);
});


app.put('/api/records/:id', (req, res) => {
    const recordId = parseInt(req.params.id);
    const newAmount = req.body.amount;
    let records = readData();
    const recordIndex = records.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        records[recordIndex].amount = newAmount;
        writeData(records);
        res.json({ message: 'Record updated successfully!', record: records[recordIndex] });
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
});


app.post('/api/upload/:id', upload.single('file'), (req, res) => {
    const recordId = parseInt(req.params.id);

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    let records = readData();
    const recordIndex = records.findIndex(r => r.id === recordId);

    if (recordIndex !== -1) {
        records[recordIndex].file = req.file.path.replace(/\\/g, '/');

        writeData(records);

        res.json({ message: 'File uploaded successfully!', record: records[recordIndex] });
    } else {
        res.status(404).json({ message: 'Record not found'});
    }
});


app.delete('/api/records/:id', (req, res) => {
    const recordId = parseInt(req.params.id);
    let records = readData();
    
    const filteredRecords = records.filter(r => r.id !== recordId);
    
    if (records.length === filteredRecords.length) {
        return res.status(404).json({ message: 'Record not found' });
    }

    writeData(filteredRecords); 
    res.json({ message: 'Record deleted successfully!' });
});


app.use('/uploads', express.static('uploads'));


app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

