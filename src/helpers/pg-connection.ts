import pg  from 'pg';

 const connection:pg.Pool=new pg.Pool({
    database:"megacount-test",
    user:"megacount-test-user",
    password:"137946",
});

connection.connect();



export default connection;

