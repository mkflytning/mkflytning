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

// Recevoir les informations du formulaire
app.post('/envoyer', (req, res) => {
  const { nom, email, telefon, adresse_depart, adresse_arrivee, taille, nombre, date_demenagement, demenagement } = req.body;

  // Configuration du transporteur nodemailer
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Email stocké dans .env
      pass: process.env.GMAIL_PASS, // Mot de passe d'application stocké dans .env
    },
  });

  // Configuration de l'email
  let mailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: 'Nouvelle demande de devis',
    text: `Nom : ${nom}\nEmail : ${email}\nTéléphone : ${telefon}\nAdresse de départ : ${adresse_depart}\nAdresse d’arrivée : ${adresse_arrivee}\nTaille : ${taille} m²\nNombre de déménageurs : ${nombre}\nDate de déménagement : ${date_demenagement}\nInformations supplémentaires : ${demenagement}`,
  };

  // Envoi de l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      return res.status(500).send('Erreur lors de l\'envoi de l\'email');
    } else {
      console.log('Email envoyé :', info.response);
      res.sendFile(path.join(__dirname, 'confirmation.html'));
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
