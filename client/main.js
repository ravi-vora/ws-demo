const authWss = new WebSocket('ws://localhost:8081/auth')

authWss.onmessage = (e) => {
    var data = JSON.parse(e.data);

    if (data?.action === 'user_signup') {
        if (data?.success) {
            console.log(data)
        } else {
            if (data?.email?.length > 0) $('#signup_email_error').text(data?.email[0]) 
            else $('#signup_email_error').text('')

            if (data?.password?.length > 0) $('#signup_password_error').text(data?.password[0])
            else $('#signup_password_error').text('')

            if (data?.confirmPassword?.length > 0) $('#signup_confirm_password_error').text(data?.confirmPassword[0])
            else $('#signup_confirm_password_error').text('')
        }
    } else if (data?.action === 'user_signin') {
        if (data?.success) {
            console.log(data)
        } else {
            if (data?.email?.length > 0) $('#signin_email_error').text(data?.email[0])
            else $('#signin_email_error').text('')

            if (data?.password?.length > 0) $('#signin_password_error').text(data?.password[0])
            else $('#signin_password_error').text('')
        }
    }
}

$('#no_account').on('click', function(e) {
    e.preventDefault();
    $('.signup_form').fadeToggle("d-none");
    $('.signin_form').fadeToggle("d-none");
    $('.signup_form').toggleClass("d-none");
    $('.signin_form').toggleClass("d-none");
})

$("#have_account").on('click', function(e) {
    e.preventDefault();
    $('.signin_form').fadeToggle("d-none");
    $('.signup_form').fadeToggle("d-none");
    $('.signup_form').toggleClass("d-none");
    $('.signin_form').toggleClass("d-none");
})

$('#signin_form').on('submit', function(e) {
    e.preventDefault();
    var data = {}

    data['action'] = 'user_signin';
    data['email'] = e.target.elements.email.value
    data['password'] = e.target.elements.password.value

    authWss.send(JSON.stringify(data));
})

$('#signup_form').on('submit', function(e) {
    e.preventDefault();
    var data = {}

    data['action'] = 'user_signup';
    data['email'] = e.target.elements.signup_email.value
    data['password'] = e.target.elements.signup_password.value
    data['confirmPassword'] = e.target.signup_confirmPassword.value

    authWss.send(JSON.stringify(data))
})