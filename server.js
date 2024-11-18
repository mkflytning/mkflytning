require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurer Multer pour l'upload des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier pour sauvegarder les fichiers
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nom unique pour chaque fichier
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Page principale (Accueil)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Accueil
});

// Page du formulaire de contact général
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Page de confirmation
app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

// Page de réclamation
app.get('/reclamation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reclam.html'));
});

// Route pour traiter le formulaire de contact général
app.post('/envoyer', (req, res) => {
    const { nom, email, telefon, adresse_depart, adresse_arrivee, taille, nombre, date_demenagement, demenagement, services } = req.body;

    // Configuration Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    // Formatage des services choisis
    let selectedServices = '';
    if (services && services.length > 0) {
        selectedServices = services.join(', ');
    } else {
        selectedServices = 'Aucun service supplémentaire sélectionné';
    }

    // Options de l'email
    let mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: 'Ny flytteforespørgsel',
        text: `Navn: ${nom}\nEmail: ${email}\nTelefon: ${telefon}\nAfgangsadresse: ${adresse_depart}\nAnkomstadresse: ${adresse_arrivee}\nStørrelse: ${taille} m²\nAntal flyttemænd: ${nombre}\nFlyttedato: ${date_demenagement}\nYderligere oplysninger: ${demenagement}\nValgte ekstra tjenester: ${selectedServices}`,
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

// Route pour traiter le formulaire de réclamation
app.post('/envoyer-reclamation', upload.array('files[]', 10), (req, res) => {
    const { nom, email, telefon, ordre, dommages, comment } = req.body;
    const files = req.files;

    // Configuration Nodemailer pour l'envoi de l'email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    // Options de l'email pour la réclamation
    const mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: 'Réclamation - MK Flytning',
        text: `Nom: ${nom}\nEmail: ${email}\nTéléphone: ${telefon}\nNuméro de commande: ${ordre}\nDommages: ${dommages}\nCommentaire: ${comment}`,
        attachments: files.map(file => ({
            path: file.path,
            filename: file.originalname,
        })),
    };

    // Envoi de l'email avec les fichiers joints
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Une erreur est survenue lors de l\'envoi du formulaire.');
        } else {
            res.send('sendt          med         succes     .');
        }
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
