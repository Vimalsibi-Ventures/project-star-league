const ADMIN_USERNAME = 'treasurer';
const ADMIN_PASSWORD = 'treasurer@oratio';

export function validateAdmin(username, password) {
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}