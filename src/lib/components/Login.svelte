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

<div class="login-container">
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
      
      <button type="submit" class="login-button">Sign in</button>
  </form>
</div>

<style>
  .login-container {
      max-width: 400px;
      margin: auto;
      padding: 20px;
      background: #f4f4f4;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
      text-align: center;
      margin-bottom: 20px;
  }
  
  .login-form {
      display: flex;
      flex-direction: column;
  }
  
  .form-group {
      margin-bottom: 15px;
  }
  
  label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
  }
  
  input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
  }
  
  .error-message {
      color: red;
      font-size: 14px;
      text-align: center;
      margin-bottom: 10px;
  }
  
  .login-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
  }
  
  .login-button:hover {
      background-color: #0056b3;
  }
</style>
