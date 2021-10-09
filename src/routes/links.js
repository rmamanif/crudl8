const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('productos/add');
});

router.post('/add', async (req, res) => {
    const { nombre, tipo, cantidad, marca, description } = req.body;
    const newLink = {
        nombre,
        tipo,
        cantidad,
        marca,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO products set ?', [newLink]);
    req.flash('success', 'Producto guardado correctamente');
    res.redirect('/productos');
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
    const { id } = req.params;
    const { nombre, tipo, cantidad, marca, description} = req.body; 
    const newLink = {
        nombre,
        tipo,
        cantidad,
        marca,
        description,
    };
    await pool.query('UPDATE products set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Producto actualizado correctamente');
    res.redirect('/productos');
});

module.exports = router;