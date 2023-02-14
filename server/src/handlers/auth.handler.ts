import { allowdAction } from "../config/auth.config.js"
import { isJson } from "../config/util.helper.js"
import { genPassword, issueJWT, validateEmail } from "../helpers/utils.helper.js"
import { User } from "../models/user.model.js"


export const handleUserSignin = (wss, ws, data) => {
    const errors = {
        email: [],
        password: []
    }

    /**
     * required validation
     */
    if (!data.email || data.email == '') errors.email.push("'email' is required")
    if (!data.password || data.password == '') errors.password.push("'password' is required")

    /**
     * format validation
     */
    if( data.email && !validateEmail(data.email) ) errors.email.push("'email' is invalid.")

    if (
        errors.email.length > 0 ||
        errors.password.length > 0
    ) {
        Object.keys(errors).map( (key: string, index: number) : void => {
            if (errors[key].length < 1) delete errors[key];
        })
        errors['success'] = false;
        errors['action'] = data.action;
        ws.send(JSON.stringify(errors));
    } else {
        User.findOne({ email: data.email }).then(user => {
            if ( !user ) {
                ws.send(JSON.stringify({
                    success: false,
                    action: data.action,
                    email: ["email is not registered"]
                }))
            } else {
                const jwt = issueJWT(user.id);

                ws.send(JSON.stringify({
                    success: true,
                    action: data.action,
                    email: user.email,
                    token: jwt.token,
                    expires: jwt.expires
                }))
            }
        }).catch((e) => {
            ws.send(JSON.stringify({
                success: false,
                action: data.action,
                general: [e.message]
            }))
        })
    }
}
export const handleUserSignup = (wss, ws, data) => {
    const errors = {
        email: [],
        password: [],
        confirmPassword: []
    }

    /**
     * required validation
     */
    if (!data.email || data.email == '') errors.email.push("'email' is required");
    if (!data.password || data.password == '') errors.password.push("'password' is required");
    if (!data.confirmPassword || data.confirmPassword == '') errors.confirmPassword.push("'confirmPassword' is required");

    /**
     * length validation
     */
    if( data.password && data.password.length > 14) errors.password.push("'password' is too long. allowed -> < 14")
    if( data.password && data.password.length < 8) errors.password.push("'password' is too short. allowed -> > 8")

    /**
     * format validation
     */
    if( data.email && !validateEmail(data.email) ) errors.email.push("'email' is invalid.")
    if( data.password && data.confirmPassword && data.password !== data.confirmPassword) errors.confirmPassword.push("'confirmPassword' does not match with password.")

    if (
        errors.email.length > 0 ||
        errors.password.length > 0 ||
        errors.confirmPassword.length > 0
    ) {
        Object.keys(errors).map( (key: string, index: number) : void => {
            if (errors[key].length < 1) delete errors[key];
        })
        errors['success'] = false;
        errors['action'] = data.action;
        ws.send(JSON.stringify(errors));
    } else {
        var encryptPassword = genPassword(data.password)


        var user = {}
        user['email'] = data.email;
        user['hash'] = encryptPassword.hash;
        user['salt'] = encryptPassword.salt;

        User.create(user).then(user => {

            const jwt = issueJWT(user.id);

            ws.send(JSON.stringify({
                success: true,
                action: data.action,
                email: user.email, 
                token: jwt.token, 
                expires: jwt.expires
            }));
        }).catch(e => {
            var message = {}
            message['success'] = false;
            message['general'] = [e.message]
            ws.send(JSON.stringify(message))

            if(e["errors"]["email"]?.message) {
                ws.send(JSON.stringify({
                    success: false,
                    email: [e["errors"]["email"].message]
                }))
            } else {
                ws.send(JSON.stringify({
                    success: false,
                    general: [e.message]
                }))
            }
        })

    }
}

export const validateData = (wss, ws, data) : boolean => {
    if (!isJson(data)) {
        ws.send(JSON.stringify({ 
            general: ["please provide a valid json"]
        }))
        return false;
    } else {
        data = JSON.parse(data)
        if (!data.action || data.action == '') {
            ws.send(JSON.stringify({ 
                action: ["'action' field is required to perform a action on your payload."]
            }))
            return false;
        } else if (!Object.keys(allowdAction).filter(request => allowdAction[request] != null).includes(data.action)) {
            ws.send(JSON.stringify({ 
                action: ["'action' is not valid."]
            }))
            return false;
        }
        return true;
    }
}

export const handleAuth = (wss, ws, data) => {
    data = data.toString('utf8')
    const isDataValid = validateData(wss, ws, data);

    data = JSON.parse(data)
    if (isDataValid && data.action === allowdAction.user_signin) {
        handleUserSignin(wss, ws, data);
    } else if (isDataValid && data.action === allowdAction.user_signup) {
        handleUserSignup(wss, ws, data);
    } else {
        console.log('logic is wrong! check again')
        ws.send(JSON.stringify({
            success: false,
            errors: {
                general: ["something went wrong."]
            }
        }))
    }
}