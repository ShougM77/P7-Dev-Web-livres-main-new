//IMPORTATION DU MODULE HTTP
const http = require('http');

//IMPORTATION DE L'APPLICATION
const app = require('./app');

//FONCTION DE NORMALISATION DU PORT D'ÉCOUTE
const normalizePort = val => {
    
    const port = parseInt(val, 10);
    
    if(isNaN(port)) 
    {
        return val;
    }
    
    if(port >= 0) 
    {
        return port;
    }
    
    return false;
};

//DÉFINITION DU PORT D'ÉCOUTE (process.env.PORT ou le port 4000)
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

//FONCTION DE GESTION D'ERREURS POUR LES ERREURS LIÉES AU SERVEUR
const errorHandler = error => {
    if(error.syscall !== 'listen') 
    {
        throw error;
    }
    const address = server.address();
    
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    
    switch(error.code) 
    {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

//CRÉATION DU SERVEUR HTTP
const server = http.createServer(app);

//GESTION DES ERREURS DU SERVEUR
server.on('error', errorHandler);
server.on('listening', () => {

    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);

});

//DÉMARRAGE DU SERVEUR EN ÉCOUTANT LE PORT SPÉCIFIÉ
server.listen(port);
