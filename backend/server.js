// importation du module http
const http = require('http');

// importation de l'application express
const app = require('./app');

// fonction pour normaliser le port
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    return port >= 0 ? port : false;
};

// définition du port d'écoute
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

// gestion des erreurs du serveur
const errorHandler = error => {
    if (error.syscall !== 'listen') throw error;
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges.`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use.`);
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// création du serveur http
const server = http.createServer(app);

// gestion des erreurs et démarrage du serveur
server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// démarrage du serveur
server.listen(port);
