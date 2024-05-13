# Task Scheduler

Task Scheduler is an application designed to synchronize tasks from Google Tasks to a Notion database. The application is set to perform this synchronization every 3 minutes, based on the account that is currently authorized.

## Overview

The application works by fetching all tasks from Google Tasks, filtering out tasks that have been updated since the last poll, and then either updates these tasks in the Notion database or adds them if they don't exist. It also deletes tasks from the Notion database if they don't exist in Google Tasks or if they're marked as deleted.

## Assumptions

The application makes the following assumptions:

- Each Task has a unique title.
- The parent page and the database it contains are already created in Notion. However, if the database is not created, it can be done so in the setup.

## Setup

To set up the application, follow these steps:

1. Create a `.env` file in the root directory of the project. This file should contain the following environment variables:

    ```
    NOTION_KEY=<your-notion-api-key>
    NOTION_PAGE_ID=<parent-page-id>
    GOOGLE_API_KEY=<your-google-api-key>
    ```

    The `NOTION_DATABASE_ID=<database-id>` can be added after running `node setup.js`.

2. Add a `credentials.json` file in the `tokens` folder. This file should contain your Google API credentials. Refer to `example.credentials.json` for the expected format and structure.

3. Install the project dependencies. Open a terminal in the project root directory and run the following command:

    ```
    npm install
    ```

4. If you need to create a new database in the specified Notion page, run the following command:

    ```
    node setup.js
    ```

    This will create a new database and print the database ID. Add this ID to the `NOTION_DATABASE_ID` variable in your `.env` file.

5. Start the application. In the terminal, run the following command:

    ```
    npm run start
    ```

## Usage

Once the application is set up and running, it will automatically sync tasks from Google Tasks to the Notion database every 3 minutes. The console will display logs indicating the tasks being updated, added, or deleted.

## Conclusion

Task Scheduler is a handy tool for keeping your tasks synchronized between Google Tasks and Notion. It's easy to set up and use, and it can save you a lot of time and effort in managing your tasks.