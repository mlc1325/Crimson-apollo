<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  
  let email = "";
  let password = "";
  let error = "";
  
  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<div class="card">
  <h2>Sign in to your account</h2>
  
  <form on:submit|preventDefault={handleLogin} class="login-form">
      <div class="form-group">
          <label for="email">Email address</label>
          <input bind:value={email} type="email" id="email" autocomplete="email" required>
      </div>

      <div class="form-group">
          <label for="password">Password</label>
          <input bind:value={password} type="password" id="password" autocomplete="current-password" required>
      </div>
      
      {#if error}
          <p class="error-message">{error}</p>
      {/if}
      
      <button on:click={() => window.location.href = '/'} type="submit" class="login-button">Sign in</button>
  </form>
</div>

<style>.card {
  max-width: 400px;               /* Constrain the card's width for a more compact look */
  width: 100%;                    /* Make the card responsive */
  margin: 100px auto;
  padding: 2rem;
  background: #000;               /* Solid black background */
  border: 1px solid #00FF00;       /* Bright green DOS-style border */
  color: #00FF00;                 /* Bright green text */
  font-family: "Courier New", Courier, monospace;
  box-sizing: border-box;         /* Include padding and border in the total width */
}

.card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #00FF00;                /* DOS green for headings */
  text-shadow: 0 0 5px #00FF00;   /* Subtle neon glow effect */
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #00FF00;
  font-family: "Courier New", Courier, monospace;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;         /* Ensures the input adapts to its container */
  padding: 0.75rem;
  background: #000;
  border: 1px solid #00FF00;
  color: #00FF00;
  font-family: "Courier New", Courier, monospace;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #00FF00;
  box-shadow: 0 0 5px #00FF00;
}

.login-button {
  width: 100%;
  box-sizing: border-box;         /* Responsive button sizing */
  padding: 0.75rem;
  background: #00FF00;            /* Bright DOS green background */
  border: 1px solid #00FF00;
  color: #000;                   /* Black text for contrast */
  font-size: 1rem;
  cursor: pointer;
  font-family: "Courier New", Courier, monospace;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.login-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px #00FF00;
}

.error-message {
  margin-bottom: 1rem;
  color: #FF0000;                /* DOS-styled error in bright red */
  text-align: center;
  font-size: 0.9rem;
  font-family: "Courier New", Courier, monospace;
}

    </style>