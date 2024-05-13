require("dotenv").config();
const cron = require('node-cron');
const { authorize } = require('./google/googleAuth');
const { getAllTasks } = require('./google/googleTasks');
const { getTasksFromDatabase, addTaskToDatabase, updateTaskInDatabase, deleteTaskFromDatabase } = require('./notion/notionDb');

let client = null;
let lastPollTime = new Date(0);

/**
 * Synchronizes tasks between Google Tasks and a Notion database.
 * It fetches all tasks from Google Tasks, filters out tasks that have been updated since the last poll,
 * and then either updates these tasks in the Notion database or adds them if they don't exist.
 * It also deletes tasks from the Notion database if they don't exist in Google Tasks or if they're marked as deleted.
 * @return {Promise<void>}
 */
async function syncTasks() {
    const tasks = await getAllTasks(client);
    const updatedTasks = tasks.filter(task => new Date(task.updated) > lastPollTime);
    const addedTasks = await getTasksFromDatabase();
    lastPollTime = new Date();

    updatedTasks.forEach(task => {
        const addedTask = addedTasks.find(addedTask => addedTask.title === task.title);
        if (addedTask) {
            console.log(`Updating task ${addedTask.id}`);
            updateTaskInDatabase(addedTask.id, task);
        } else {
            addTaskToDatabase(task);
        }
    });

    addedTasks.forEach(addedTask => {
        const task = tasks.find(task => task.title === addedTask.title);

        if (!task || task.deleted) {
            console.log(`Deleting task ${addedTask.id}`);
            deleteTaskFromDatabase(addedTask.id);
        }
    });
}

cron.schedule('*/3 * * * *', syncTasks);

authorize().then(cl => {
    client = cl;
    syncTasks();
});
