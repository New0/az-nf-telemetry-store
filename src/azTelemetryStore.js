import { app } from '@azure/functions';
import mysql from 'mysql2/promise';
import Airtable from 'airtable';
import { createClient } from '@supabase/supabase-js';

const fetchDataFromAWS = async () => {

    try {  
        const connection = await mysql.createConnection({
            host: 'nf-telemetry-01.ca5a8eropr1q.us-east-1.rds.amazonaws.com',
            user: process.env.aws_user,
            password: process.env.aws_key,
            database: 'vapor'
        });
        // Connect to MySQL
        connection.connect();
        // Query MySQL
        return await connection.query('SELECT * FROM plugins ORDER BY created_at DESC LIMIT 10');

    } catch(e) {
        console.error(e);
        return e;
    }
};

const sendToAirtable = async (data) => {
    console.log(process.env.airtable_key);
    const base = new Airtable({ apiKey: process.env.airtable_key }).base('appR1N9ZuliX4gH8w/tbleVbDR6RihTcXkN');

    let records = [];
    await data[0].forEach(element => {
        console.log(element.name);
        base('Basic').create({
            "Name": element.name,
            "Path": element.path,
            "tags": element.tags,
            "url": element.url,
            "type": element.type
        }, (err, record) => {
            if (err) { 
                console.error(err);
                records.push("error");
                return; 
            }
            
            console.log(record);
            records.push(record.id)
            console.log('Record created!');
        });
    });

    return records;
};

const sendToSupabase = async (rds) => {

    const supabase = createClient(process.env.supabase_url, process.env.supabase_key);

    let sendData = []
    rds[0].forEach(element => {
        sendData.push({
            created_at: element.created_at,
            name: element.name,
            path: element.path,
            url: element.url,
            tags: element.tags
        });
    });

    const { data, error } = await supabase
    .from('Basic')
    .insert(sendData)
    .select()
            
    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log(data);
        console.log('Data inserted successfully');
    }

};

app.http('azTelemetryStore', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log(`azTelemetryStore function processed request for url "${request.url}"`);

        //const name = request.query.get('name') || await request.text() || 'world';

        const pluginsData = await fetchDataFromAWS();

        const airtableRecords = await sendToAirtable( pluginsData );

        const supabaseRecords = await sendToSupabase( pluginsData );

        return { body: 'Sending' };
    }
});
