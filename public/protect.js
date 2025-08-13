(async () => {
    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
      alert("Auth client not initialized.");
      window.location.href = "login.html";
      return;
    }
  
    const { data } = await supabaseClient.auth.getSession();
    const session = data?.session;
  
    if (!session) {
      // not logged in
      window.location.href = "login.html";
      return;
    }
  
    // OPTIONAL: if you want to enforce email verification on the form page
    const { data: userData, error } = await supabaseClient.auth.getUser();
    if (!error && userData?.user && !userData.user.email_confirmed_at) {
      alert("Please verify your email first, then log in.");
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    }
  })();
  