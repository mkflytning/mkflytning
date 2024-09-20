const sqlite3 = require('sqlite3').verbose();

// Ouvrir une connexion à la base de données
const db = new sqlite3.Database('./reviews.db');

// Créer la table des avis
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stars INTEGER NOT NULL,
        review TEXT NOT NULL
    )`);
});

db.close();