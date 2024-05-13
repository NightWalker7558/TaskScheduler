require("dotenv").config()
const { createDatabaseIfNotExists } = require('./notion/notionDb');

createDatabaseIfNotExists().then((response) => {
    console.log(`Set your environment variable NOTION_DATABASE_ID to ${response.id.replace(/-/g, '')} to use the Notion database.`);
});