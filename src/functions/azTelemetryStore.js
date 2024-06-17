import { app } from '@azure/functions';
import mysql from 'mysql2/promise';
import Airtable from 'airtable';
import { createClient } from '@supabase/supabase-js';

const fetchDataFromAWS = async () => {

    try {  
        const connection = await mysql.createConnection({
            host: process.env.aws_url,
            user: process.env.aws_user,
            password: process.env.aws_key,
            database: process.env.aws_db
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

    const base = new Airtable({ apiKey: process.env.airtable_key }).base(process.env.airtable_db);

    let records = [];
    data[0].forEach( element => {
        records.push({
            "fields": {
                "Name": element.name,
                "Path": element.path,
                "tags": element.tags,
                "url": element.url,
                "type": element.type
            }
        });
    });

    const {err, record} = await base(process.env.airtable_tble).create(records);

    if (err) { 
        console.error(err);
        records.push("error");
        return; 
    } else {
        console.log(record);
        return record;
        console.log('Record created!');
    }
    
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
        return data;
    }

};

app.http('azTelemetryStore', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log(`azTelemetryStore function processed request for url "${request.url}"`);

        const action = request.query.get('action');

        if(!action) {

            return new BadRequestObjectResult("Action not set.");

        } else {

            //Get data
            const pluginsData = await fetchDataFromAWS();

            // Dispatch data based on action
            if(action === "airtable"){

                await sendToAirtable( pluginsData );

            } else if(action === "supabase"){

                await sendToSupabase( pluginsData );

            } else {

                return new BadRequestObjectResult("Unknown action.");
                
            }
        }
    }
});
