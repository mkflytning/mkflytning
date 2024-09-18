require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Page de confirmation
app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'confirmation.html'));
});

// Route pour traiter le formulaire
app.post('/envoyer', (req, res) => {
    const { nom, email, telefon, adresse_depart, adresse_arrivee, taille, nombre, date_demenagement, demenagement } = req.body;

    // Configuration Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mkflytning@gmail.com',
            pass: 'u d u n z q o u x h w b b r a b',
        },
    });

    // Options de l'email
    let mailOptions = {
        from: email,
        to: 'mkflytning@gmail.com',
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

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
