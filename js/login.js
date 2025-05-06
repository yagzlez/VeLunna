import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://nhfuyokthqnzbmhbfdjd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZnV5b2t0aHFuemJtaGJmZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE5MTMsImV4cCI6MjA2MTk1NzkxM30.egjmV7jARfDpYns93oPpYeciqdkP7SmIBeBsViLz6cQ' 
);

document.querySelector('.auth-button').addEventListener('click', async () => {
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error?.message === "Email not confirmed") {
    alert("Please check your inbox and confirm your email.");
    return;
  }

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "index.html";
  }
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
