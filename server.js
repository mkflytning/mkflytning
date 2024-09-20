require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Ajout de sqlite3
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ouvrir la base de données SQLite
const db = new sqlite3.Database('./reviews.db', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Page principale (Accueil)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Accueil
});

// Page du formulaire
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Page de confirmation
app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

// Route pour traiter le formulaire
app.post('/envoyer', (req, res) => {
    const { nom, email, telefon, adresse_depart, adresse_arrivee, taille, nombre, date_demenagement, demenagement } = req.body;

    // Configuration Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Assure-toi que GMAIL_USER est défini dans les variables d'environnement
            pass: process.env.GMAIL_PASS, // Assure-toi que GMAIL_PASS est défini dans les variables d'environnement
        },
    });

    // Options de l'email
    let mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: 'Ny flytteforespørgsel',
        text: `Navn: ${nom}\nEmail: ${email}\nTelefon: ${telefon}\nAfgangsadresse: ${adresse_depart}\nAnkomstadresse: ${adresse_arrivee}\nStørrelse: ${taille} m²\nAntal flyttemænd: ${nombre}\nFlyttedato: ${date_demenagement}\nYderligere oplysninger: ${demenagement}`,
    };

    // Envoi de l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Der opstod en fejl ved afsendelse af email.');
        } else {
            res.redirect('/confirmation');
        }
    });
});

// Route pour recevoir et enregistrer les avis
app.post('/reviews', (req, res) => {
    const { stars, review } = req.body;

    if (!stars || !review) {
        return res.status(400).send('Udfyld venligst både stjerner og anmeldelse.');
    }

    // Insérer l'avis dans la base de données
    db.run('INSERT INTO reviews (stars, review) VALUES (?, ?)', [stars, review], function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send('Der opstod en fejl ved indsendelse af anmeldelse.');
        }
        res.status(200).send('Tak for din anmeldelse!');
    });
});

// Route pour récupérer les avis
app.get('/get-reviews', (req, res) => {
    db.all('SELECT * FROM reviews', [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Der opstod en fejl ved hentning af anmeldelser.');
        }
        res.json(rows);
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
