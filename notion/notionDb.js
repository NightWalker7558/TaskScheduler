require("dotenv").config()
const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: process.env.NOTION_KEY,
})

/**
 * Converts a task object from Google Tasks into a properties object for use with the Notion API.
 * @param {Object} task - The Google Task API 'task' object.
 * @return {Object} - The Notion API 'properties' object.
 */
async function getPropertiesFromTask(task) {
    let properties = {
        "Name": {
            "title": [
                {
                    "text": {
                        "content": task.title || "No title"
                    }
                }
            ]
        },
        "Description": {
            "rich_text": [
                {
                    "text": {
                        "content": task.notes || "No description"
                    }
                }
            ]
        },
        "Status": {
            "select": {
                "name": task.status === "needsAction" ? "incomplete" : task.status || "No status"
            }
        },
        "Task List": {
            "rich_text": [
                {
                    "text": {
                        "content": task.parentTitle || "No task list"
                    }
                }
            ]
        }
    };

    if (task.due) {
        properties["Due Date"] = {
            "date": {
                "start": task.due
            }
        };
    }

    if (task.completed) {
        properties["Completion Date"] = {
            "date": {
                "start": task.completed
            }
        };
    }

    return properties;
};

/**
 * Retrieves the Notion database if it exists, otherwise creates a new one.
 * @return {Object} The response from the Notion API.
 */
async function createDatabaseIfNotExists() {
    try {
        const response = await notion.databases.retrieve({
            database_id: process.env.NOTION_DATABASE_ID
        });

        // Return the response that also states that the databse already exists.
        return response;
    } catch (error) {
        const response = await notion.databases.create({
            "title": [
                {
                    "text": {
                        "content": "Tasks"
                    }
                }
            ],
            parent: {
                "type": "page_id",
                "page_id": process.env.NOTION_PAGE_ID
            },
            "properties": {
                "Name": {
                    "title": {}
                },
                "Description": {
                    "rich_text": {}
                },
                "Status": {
                    "select": {
                        "options": [
                            {
                                "name": "completed"
                            },
                            {
                                "name": "incomplete"
                            }
                        ]
                    }
                },
                "Due Date": {
                    "date": {}
                },
                "Completion Date": {
                    "date": {}
                },
                "Task List": {
                    "rich_text": {}
                }
            }
        });

        return response;
    }
};

/**
 * Retrieves all tasks from the Notion database.
 * @return {Array} An array of task objects.
 */
async function getTasksFromDatabase() {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({
        database_id: databaseId,
    });

    return response.results.map(task => {
        return {
            id: task.id,
            title: task.properties.Name.title[0].text.content,
            description: task.properties.Description.rich_text[0].text.content,
            status: task.properties.Status.select.name,
            due: task.properties["Due Date"] && task.properties["Due Date"].date ? task.properties["Due Date"].date.start : null,
            completed: task.properties["Completion Date"] && task.properties["Completion Date"].date ? task.properties["Completion Date"].date.start : null,
            parentTitle: task.properties["Task List"].rich_text[0].text.content
        };
    });
}

/**
 * Adds a new task to the Notion database.
 * @param {Object} task - The task object.
 * @return {Object} The response from the Notion API.
 */
async function addTaskToDatabase(task) {
    const databaseId = process.env.NOTION_DATABASE_ID;

    const response = await notion.pages.create({
        parent: {
            type: "database_id",
            database_id: databaseId
        },
        properties: await getPropertiesFromTask(task)
    });

    return response;
}

/**
 * Updates a task in the Notion database.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} task - The new task object.
 * @return {Object} The response from the Notion API.
 */
async function updateTaskInDatabase(taskId, task) {
    const properties = await getPropertiesFromTask(task);

    const response = await notion.pages.update({
        page_id: taskId,
        properties: properties
    });

    return response;
}

/**
 * Deletes a task from the Notion database.
 * @param {string} taskId - The ID of the task to delete.
 * @return {Object} The response from the Notion API.
 */
async function deleteTaskFromDatabase(taskId) {
    const response = await notion.pages.update({
        page_id: taskId,
        in_trash: true
    });

    return response;
}

module.exports = {
    createDatabaseIfNotExists,
    addTaskToDatabase,
    getTasksFromDatabase,
    updateTaskInDatabase,
    deleteTaskFromDatabase
}