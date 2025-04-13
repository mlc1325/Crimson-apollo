<script lang="ts">
    import { auth } from '$lib/firebase';
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { goto } from '$app/navigation';
  
    let email = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
  
    async function handleRegister() {
      error = "";
      if (password !== confirmPassword) {
        error = "Passwords do not match.";
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        goto('/'); // Redirect after successful registration
      } catch (e) {
        error = (e as Error).message;
      }
    }
  </script>
  
  <div class="register-container">
    <h2>Register</h2>
  
    {#if error}
      <div class="error">{error}</div>
    {/if}
  
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" bind:value={email} required>
    </div>
  
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required>
    </div>
  
    <div class="form-group">
      <label for="confirm-password">Confirm Password:</label>
      <input type="password" id="confirm-password" bind:value={confirmPassword} required>
    </div>
  
    <button on:click={handleRegister}>Create Account</button>
  </div>
  
  <style>
.register-container {
  max-width: 400px;                /* Limit width to 400px */
  margin: 50px auto;
  padding: 20px;
  background: #000;                /* Solid DOS-style black background */
  border: 1px solid #00FF00;        /* Bright green border */
  color: #00FF00;                 /* Bright green text */
  font-family: "Courier New", Courier, monospace;
}

h2 {
  color: #00FF00;                 /* DOS-style green for headings */
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 4px #00FF00;    /* Subtle neon glow effect */
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #00FF00;
  font-family: "Courier New", Courier, monospace;
}

input {
  width: 100%;
  box-sizing: border-box;  /* Ensure padding and border are included in the width */
  padding: 10px;
  border: 1px solid #00FF00;  /* DOS green border */
  background-color: #000;     /* Solid black background */
  color: #00FF00;             /* Bright green text */
  font-family: "Courier New", Courier, monospace;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #00FF00;      /* DOS green focus */
  box-shadow: 0 0 4px #00FF00;
}


button {
  width: 100%;
  padding: 10px;
  border: 1px solid #00FF00;
  background: #00FF00;            /* Bright green background */
  color: #000;                   /* Contrasting black text */
  cursor: pointer;
  font-family: "Courier New", Courier, monospace;
  transition: transform 0.3s, box-shadow 0.3s;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 6px #00FF00;
}

.error {
  text-align: center;
  color: #FF0000;                /* Bright red for error messages */
  margin-bottom: 15px;
  font-family: "Courier New", Courier, monospace;
}

  </style>
  