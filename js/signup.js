import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://nhfuyokthqnzbmhbfdjd.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ'; // replace this with your real anon key


const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email/password sign-up
document.querySelector('.auth-button').addEventListener('click', async () => {
  const firstName = document.getElementById('firstName').value;
  const surname = document.getElementById('surname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: firstName,
        surname: surname,
        phone: phone
      }      
    }
  });

  if (error) {
    alert(error.message);
  } else {
    // ✅ Redirect to homepage
    window.location.href = 'index.html';
  }
});

// Google sign-up
document.querySelector('.google-button').addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://www.velunna.co.uk/index.html'
    }
  });

  if (error) alert(error.message);
});
