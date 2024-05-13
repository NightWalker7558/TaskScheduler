const { google } = require('googleapis');

/**
 * Retrieves all task lists from the Google Tasks API.
 * @param {Object} auth - The authentication object.
 * @return {Array} An array of task list objects.
 */
async function getTaskLists(auth) {
    const service = google.tasks({ version: 'v1', auth });
    const res = await service.tasklists.list();
    return res.data.items;
}

/**
 * Retrieves all tasks from a specific task list from the Google Tasks API.
 * @param {Object} auth - The authentication object.
 * @param {string} taskListId - The ID of the task list.
 * @return {Array} An array of task objects.
 */
async function getTasks(auth, taskListId) {
    const service = google.tasks({ version: 'v1', auth });
    const res = await service.tasks.list({
        tasklist: taskListId,
        showHidden: true,
        showDeleted: true,
    });
    return res.data.items;
}

/**
 * Retrieves all tasks from all task lists from the Google Tasks API.
 * @param {Object} auth - The authentication object.
 * @return {Array} An array of task objects.
 */
async function getAllTasks(auth) {
    console.log('Getting all tasks');
    const taskLists = await getTaskLists(auth);
    console.log(`Found ${taskLists.length} task lists`);
    const tasks = [];
    for (const taskList of taskLists) {
        const taskListTasks = await getTasks(auth, taskList.id);
        for (const task of taskListTasks) {
            task.parentTitle = taskList.title;
        }
        tasks.push(...taskListTasks);
    }

    console.log(`Found ${tasks.length} tasks`);

    return tasks;
}

module.exports = {
    getAllTasks,
};