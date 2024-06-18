# NF Telemetry store on Azure

## Test function to get data from an AWS RDS mysql database and dispatch it in other services, optimized databases

#### https://aztelemetrystore.azurewebsites.net
This function is deployed at - https://aztelemetrystore.azurewebsites.net -. It only accepts <b>POST</b> requests and an "action" parameter. 

### Get data
The function fetches the last 10 entries in the plugins table of the AWS RDS MySQL database. Saturday Drive user owns the database at - https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#database:id=nf-telemetry-01;is-cluster=false - 

### Send data
#### https://aztelemetrystore.azurewebsites.net?action=airtable
Using airtable as the action parameter the function will store the Name, Path, tags, URL, and type columns of the last ten rows grabbed from the RDS database in an airtable table.

You can view the database joining in with a @saturdaydrive email address at - https://airtable.com/invite/l?inviteId=invdjrIVhXIiiLgLT&inviteToken=a72b63a7870764f4e858fb707e3ba517bffc68467fc0810e17b655de19bcefd8&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts -

#### https://aztelemetrystore.azurewebsites.net?action=supabase
Using supabase parameter, the function will send the Name, Path, tags, URL, and type columns of the last ten rows grabbed from the RDS database in a supabase table. 
I don't know how to share access to supabase, if we want to push more tests with this tool we'll create a Saturday Drive owned environment.

## Local development and testing
 You can clone - https://github.com/New0/az-nf-telemetry-store.git - and start the local development environment using an Azure extension if you use Visual Studio Code or an npm package that provides a CLI.
 More details at - https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local -

You will need to add a local.setting.json file at the root of the project, it is shared in 1password Saturday-Drive web dev vault as az-nf-telemetry-store. And run `npm install` or `yarn`

The default url will be - http://localhost:7071/api/azTelemetryStore/?action=airtable - 
