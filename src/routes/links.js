const express = require('express');
const formidable = require('formidable');
const router = express.Router();    
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: 'dt4pte1vh',
    api_key: 468844585347417,
    api_secret: 'hLZUt1Rz6N5V06U6p4iS9A2i4c4'
  });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "DEV",
    },
  });

const upload = multer({ storage: storage });

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('productos/add');
});



router.post('/add', async (req, res) => {
    const form = new formidable.IncomingForm();
    console.log(form);
    form.parse(req, async (err, fields, files) => {
        // console.log(fields);
        // console.log(files.imagen.newFilename);
        //console.log(files.imagen.filepath);
        await cloudinary.uploader.upload(files.imagen.filepath,{public_id:`${files.imagen.newFilename}`}, function(error, result)  
        {console.log(result, error)});
        
        var imagenurl= await cloudinary.url(`${files.imagen.newFilename}`);
        console.log(imagenurl);
        const { nombre, tipo, cantidad, marca, description } = fields;
        const newLink = {
            nombre,
            tipo,
            cantidad,
            marca,
            description,
            user_id: req.user.id,
            imagen:imagenurl
        };
        await pool.query('INSERT INTO products set ?', [newLink]);
        req.flash('success', 'Producto guardado correctamente');
        res.redirect('/productos');
      });
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query('SELECT * FROM products WHERE user_id = ?', [req.user.id]);

    res.render('productos/list', { links });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE ID = ?', [id]);
    req.flash('success', 'Producto eliminado correctamente');
    res.redirect('/productos');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    console.log(links);
    res.render('productos/edit', {link: links[0]});
});

router.post('/edit/:id', async (req, res) => {
    const form = new formidable.IncomingForm();
    console.log(form);
    form.parse(req, async (err, fields, files) => {
        await cloudinary.uploader.upload(files.imagen.filepath,{public_id:`${files.imagen.newFilename}`}, function(error, result)  
        {console.log(result, error)});
        var imagenurl2= await cloudinary.url(`${files.imagen.newFilename}`);
        const { id } = req.params;
        const { nombre, tipo, cantidad, marca, description} = fields; 
        const newLink = {
            nombre,
            tipo,
            cantidad,
            marca,
            description,
            imagen:imagenurl2
        };
        await pool.query('UPDATE products set ? WHERE id = ?', [newLink, id]);
        req.flash('success', 'Producto actualizado correctamente');
        res.redirect('/productos');
    });
});

module.exports = router;