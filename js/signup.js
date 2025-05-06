import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ' 

);

document.getElementById('showPassword').addEventListener('change', (e) => {
  const pwd = document.getElementById('password');
  const confirm = document.getElementById('confirmPassword');
  const type = e.target.checked ? 'text' : 'password';
  pwd.type = type;
  confirm.type = type;
});

function isPasswordStrong(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*.,?])[A-Za-z\d!@#\$%\^&\*.,?]{8,}$/.test(password);
}

document.querySelector('.auth-button').addEventListener('click', async () => {
  const firstName = document.getElementById('firstName').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const message = document.getElementById('passwordMessage');

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.display = "block";
    return;
  }

  if (!isPasswordStrong(password)) {
    message.textContent = "Password must be at least 8 characters, include a capital letter, a number, and a special character.";
    message.style.display = "block";
    return;
  }

  message.style.display = "none";

  const { data: existingUsers } = await supabase
    .from('users')
    .select('email, phone')
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (existingUsers.length > 0) {
    alert("Email or phone number already in use.");
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    alert(authError.message);
    return;
  }

  // Add to 'users' table
  await supabase.from('users').insert({
    id: authData.user.id,
    email,
    first_name: firstName,
    surname,
    phone
  });

  alert("Account created! Please check your email to confirm.");
  window.location.href = "login.html";
});

document.querySelector('.google-button').addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://www.velunna.co.uk/index.html'
    }
  });

  if (error) alert(error.message);
});
