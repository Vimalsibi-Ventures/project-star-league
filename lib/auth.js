export function validateAdmin(username, password) {
    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;
    
    return username === validUser && password === validPass;
}